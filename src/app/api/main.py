from youtube_transcript_api import YouTubeTranscriptApi
import openai
import os
import asyncio
from dotenv import load_dotenv
import sys
import json
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([entry['text'] for entry in transcript])
    except Exception as e:
        logging.error("Error in summarize_chunk: %s", e)
        return str(e)

async def summarize_chunk(chunk):
    try:
        response = await openai.ChatCompletion.acreate(
            model='gpt-4',
            messages=[
                {"role": "system", "content": "Summarize the following transcript:"},
                {"role": "user", "content": chunk}
            ],
        )
        return response.choices[0].message['content']
    except Exception as e:
        return str(e)

async def summarize_chapters_and_topics(chunk):
    try:
        response = await openai.ChatCompletion.acreate(
            model='gpt-4',
            messages=[
                {"role": "system", "content": "Get the chapters and topics from the following transcript:"},
                {"role": "user", "content": chunk}
            ],
        )
        return response.choices[0].message['content']
    except Exception as e:
        return str(e)
    
async def summarize_key_questions(chunk):
    try:
        response = await openai.ChatCompletion.acreate(
            model='gpt-4',
            messages=[
                {"role": "system", "content": "Get the top 1 or 2 key questions posed from the following transcript:"},
                {"role": "user", "content": chunk}
            ],
        )
        return response.choices[0].message['content']
    except Exception as e:
        return str(e)
    
async def summarize_transcript(video_id):
    transcript = get_transcript(video_id)
    chunk_size = 8000
    try:
            # Split the transcript into chunks of chunk_size
        chunks = [transcript[i:i + chunk_size] for i in range(0, len(transcript), chunk_size)]
        
        # Process each chunk asynchronously

        summaries = await asyncio.gather(*(summarize_chunk(chunk) for chunk in chunks))

        # Combine the summaries
        return ' '.join(summaries)
    except Exception as e:
        return str(e)
    
async def chapters_summary(video_id):
    transcript = get_transcript(video_id)
    chunk_size = 8000
    try:
            # Split the transcript into chunks of chunk_size
        chunks = [transcript[i:i + chunk_size] for i in range(0, len(transcript), chunk_size)]
        
        # Process each chunk asynchronously
        chapters = await asyncio.gather(*(summarize_chapters_and_topics(chunk) for chunk in chunks))

        response = await openai.ChatCompletion.acreate(
            model='gpt-4',
            messages=[
                {"role": "system", "content": "Return the following content but renumber the chapters from 1 to n instead of starting over from 1 every time. Also add new line after each chapter and its content."},
                {"role": "user", "content": ' '.join(chapters)}
            ],
        )
        return response.choices[0].message['content']
    
    except Exception as e:
        return str(e)

async def generate_questions(video_id):
    transcript = get_transcript(video_id)
    chunk_size = 8000
    try:
            # Split the transcript into chunks of chunk_size
        chunks = [transcript[i:i + chunk_size] for i in range(0, len(transcript), chunk_size)]
        
        # Process each chunk asynchronously
        questions = await asyncio.gather(*(summarize_key_questions(chunk) for chunk in chunks))
        
        response = await openai.ChatCompletion.acreate(
            model='gpt-4',
            messages=[
                {"role": "system", "content": "Return the following content but renumber the questions from 1 to n instead of starting over from 1 every time. Also add new line after each question."},
                {"role": "user", "content": ' '.join(questions)}
            ],
        )
        return response.choices[0].message['content']
        
    except Exception as e:
        return str(e)


async def main():
    if len(sys.argv) < 3:
        logging.error("Usage: python main.py <command> <video_id>")
        return

    command = sys.argv[1]
    video_id = sys.argv[2]
    if command == "get_transcript":
        try:
            transcript = get_transcript(video_id)
            print(transcript)
        except Exception as e:
            logging.error(f"An error occurred during summarization: {e}")
            sys.exit(1)  # Exit with an error code
    elif command == "summarize_transcript":
        try:
            summary = await summarize_transcript(video_id)
            print(summary)
        except Exception as e:
            logging.error(f"An error occurred during summarization: {e}")
            sys.exit(1)  # Exit with an error code
    elif command == "generate_questions":
        try:
            questions = await generate_questions(video_id)
            print(questions)
        except Exception as e:
            logging.error(f"An error occurred during questions: {e}")
            sys.exit(1)  # Exit with an error code
    elif command == "chapters_summary":
        try:
            chapters = await chapters_summary(video_id)
            print(chapters)
        except Exception as e:
            logging.error(f"An error occurred during chapters: {e}")
            sys.exit(1)  # Exit with an error code
    else:
        pass

if __name__ == "__main__":
    asyncio.run(main())
