const dotenv = require("dotenv");
const express = require('express');
const router = express.Router();
const { Document } = require("langchain/document"); // Adjust this based on actual structure
const { OpenAIEmbeddings } = require("langchain/embeddings/openai"); // Adjust this based on actual structure
const { SupabaseVectorStore } = require("langchain/vectorstores/supabase"); // Adjust this based on actual structure
const { createClient } = require("@supabase/supabase-js");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter"); // Adjust this based on actual structure
const { OpenAI } = require("langchain/llms/openai");
const { VectorDBQAChain } = require("langchain/chains");
const { StreamingTextResponse, LangChainStream } = require("ai");
const { CallbackManager } = require("langchain/callbacks");


const fs = require("fs");
const path = require("path");
const axios = require('axios');

dotenv.config();

const { exec } = require('child_process');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PRIVATE_KEY || !process.env.OPENAI_API_KEY) {
  console.error("Please set the SUPABASE_URL, SUPABASE_PRIVATE_KEY, and OPENAI_API_KEY in your .env file");
  process.exit(1);
}



async function processDocuments(fileContent) {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: 1000,
    chunkOverlap: 50,
  });

  const splitDocs = await splitter.splitText(fileContent);
  const langchainDocs = splitDocs.map((doc) => {
    return new Document({
      pageContent: doc,
    });
  });

  const auth = {
    detectSessionInUrl: false,
    persistSession: false,
    autoRefreshToken: false,
  };

  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PRIVATE_KEY,
    { auth }
  );

  await SupabaseVectorStore.fromDocuments(
    langchainDocs.flat(),
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    {
      client,
      tableName: "documents",
    }
  );
}

router.post("/process-docs", async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    console.error('Video ID is missing');
    return res.status(400).send('Video ID is required');
  }
  const scriptPath = 'api/main.py'; // Use an absolute path
  const command = `python3 ${scriptPath} get_transcript ${videoId}`;

  try {
    const stdout = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Exec error:', error);
          return reject(new Error('Server Error'));
        }
        if (stderr) {
          console.warn('Stderr:', stderr);
          // Handle or log stderr as needed
        }
        resolve(stdout);
      });
    });

    const searchResults = await processDocuments(stdout);
    res.json(searchResults);
  } catch (err) {
    console.error('Try-catch error:', err);
    res.status(500).send('Server Error');
  }
});

router.post('/tts', async (req, res) => {
  const options = {
    method: 'POST',
    headers: {
      'Cartesia-Version': '2024-06-10',
      'X-API-Key': process.env.CARTESIA_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model_id: 'sonic-english',
      transcript: req.query.transcript || "",
      duration: req.query.duration || 123,
      voice: req.query.voice || {
        mode: 'id',
        id: 'a0e99841-438c-4a64-b679-ae501e7d6091'
      },
      output_format: req.body.output_format || {
        container: 'wav',
        encoding: 'pcm_f32le',
        sample_rate: 44100
      },
      language: req.body.language || 'en'
    })
  };

  try {
    const response = await fetch('https://api.cartesia.ai/tts/sse', options);

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';
      
      let allAudioData = new Uint8Array();
 
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });

          let boundary = buffer.indexOf('\n');
          while (boundary !== -1) {
            const jsonString = buffer.substring(0, boundary);
            buffer = buffer.substring(boundary + 1);
            if (jsonString.trim()) {
              
              const jsonChunk = JSON.parse(jsonString.slice(5));
              
              if (jsonChunk.done) {
                done = true;
                break;
              }
              const base64Data = jsonChunk.data;
              const binaryString = atob(base64Data);
              const binaryLen = binaryString.length;
              const bytes = new Uint8Array(binaryLen);
              for (let i = 0; i < binaryLen; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              // Concatenate audio data
              const newAudioData = new Uint8Array(allAudioData.length + bytes.length);
              newAudioData.set(allAudioData);
              newAudioData.set(bytes, allAudioData.length);
              allAudioData = newAudioData;
            }
            boundary = buffer.indexOf('\n');
          }
        }
      }

      res.json(allAudioData);
    }
  } catch (error) {
    console.error('Error fetching TTS data:', error);
    res.status(500).send('Server Error');
  }
});

router.post('/vector-qa', async (req, res) => {
  try {
    
    const { prompt } = req.body;
    console.log(prompt)
    const privateKey = process.env.SUPABASE_PRIVATE_KEY;
    if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error(`Expected env var SUPABASE_URL`);

    const auth = {
      detectSessionInUrl: false,
      persistSession: false,
      autoRefreshToken: false,
    };
    const client = createClient(url, privateKey, { auth });

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      },
    );
    const { stream, handlers } = LangChainStream();

    const model = new OpenAI({
      streaming: true,
      modelName: "gpt-3.5-turbo-16k",
      openAIApiKey: process.env.OPENAI_API_KEY,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: false,
    });
    
    chain.call({ query: prompt });
    const reader = stream.getReader();
    res.setHeader('Content-Type', 'application/octet-stream'); // Set the correct content type


  async function processText() {
    try {
      const { done, value } = await reader.read();
      if (done) {
        res.end(); // Finalize the response when the stream is done
        return;
      }
      res.write(value); // Use res.write to send chunks of data
      // Call processText again to handle the next chunk
      processText();
    } catch (error) {
      console.error('Error in processText:', error);
      res.status(500).send('Error processing text');
    }
  }

  
  await processText();


  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

