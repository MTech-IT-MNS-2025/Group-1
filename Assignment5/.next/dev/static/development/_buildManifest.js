self.__BUILD_MANIFEST = {
  "/": [
    "static/chunks/pages/index.js"
  ],
  "/chat": [
    "static/chunks/pages/chat.js"
  ],
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/",
    "/_app",
    "/_error",
    "/api/messages",
    "/api/register",
    "/api/users/[username]",
    "/chat"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()