const navigation = [
  {
    name: "Home",
    href: "https://github.com/ivoryttang/youtube-summarizer",
    current: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  return (
    <div className="bg-gray-900 w-full fixed top-0 z-10">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <div className="ml-6">
              <div className="flex space-x-2 sm:space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium",
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="px-3 py-2 text-gray-300">
                  <iframe
                    src="https://ghbtns.com/github-btn.html?user=ivoryttang&repo=youtube-summarizer&type=star&count=true"
                    frameBorder="0"
                    scrolling="0"
                    width="150"
                    height="20"
                    title="GitHub"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
