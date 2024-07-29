import { ShareSecretForm } from "./components";

export const ShareSecretPublicPage = () => {
  return (
    <div className="flex h-screen flex-col justify-between bg-gradient-to-tr from-mineshaft-700 to-bunker-800 text-gray-200 dark:[color-scheme:dark]">
      <div />
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-b from-white to-bunker-200 bg-clip-text px-4 text-center text-3xl font-medium text-transparent">
            Share a Secret
          </h1>
          <p className="text-md">
            Powered by{" "}
            <a
              href="https://github.com/infisical/infisical"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bold bg-gradient-to-tr from-yellow-500 to-primary-500 bg-clip-text text-transparent"
            >
              Infisical &rarr;
            </a>
          </p>
        </div>
        <div className="rounded-lg border border-mineshaft-600 bg-mineshaft-800 p-4">
          <ShareSecretForm isPublic />
        </div>
      </div>
      <div className="w-full bg-mineshaft-600 p-2">
        <p className="text-center text-sm text-mineshaft-300">
          Made with ❤️ by{" "}
          <a className="text-primary" href="https://infisical.com">
            Infisical
          </a>
          <br />
          156 2nd st, 3rd Floor, San Francisco, California, 94105, United States. 🇺🇸
        </p>
      </div>
    </div>
  );
};
