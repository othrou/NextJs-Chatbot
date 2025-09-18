https://ai-sdk.dev/elements/examples/chatbot


## ****************************\***************************** Client side ************************************\*************************************

### 1. **State Management with React's `useState`**:

- **`input`**: This state holds the current user input in the text area.

  - Initialized as an empty string (`''`).
  - The input field updates this state as the user types.

- **`model`**: This state holds the value of the selected AI model (e.g., GPT 4o or Deepseek R1).

  - Initialized to the first model in the `models` array (`models[0].value`).

- **`webSearch`**: A boolean state that controls whether a web search is enabled or not.

  - Initialized as `false`.

- **`useChat` Hook**: Provides the following:

  - **`messages`**: A list of all messages in the conversation.
  - **`sendMessage`**: A function to send a message to the AI.
  - **`status`**: The current status of the assistant (like whether it's processing or idle).

### 2. **`handleSubmit` Function**:

This function handles the message submission logic when the user sends a message.

- It checks if the message contains **text** or **attachments**.
- If neither exists, it does nothing.
- If the message has text or attachments, it sends the message to the assistant using `sendMessage`.

  - It passes the text (or default text `'Sent with attachments'`) and any attached files.
  - It also sends the current **model** and **webSearch** state to configure the assistant.

- After sending the message, it resets the **`input`** state (clearing the input field).

### 3. **JSX Structure**:

#### Outer Layout:

- **`<div className="max-w-4xl mx-auto p-6 relative size-full h-screen">`**:

  - This is the container that wraps the entire chat UI, making it responsive and centered.

#### Conversation Section:

- **`<Conversation className="h-full">`**: The container for the conversation section.
- **`<ConversationContent>`**: This contains the conversation content and maps through all the messages from `messages` to render them.

  - Each **message** is iterated through with `messages.map()`.
  - For each message, the code checks the **role** (user or assistant) and renders different UI elements based on the message content.
  - **Sources**: If the assistant message has a source URL, a **Sources** component is displayed with the link.
  - **Message Parts**: The `message.parts.map()` function checks the type of each part of the message (`text`, `reasoning`, etc.) and renders the appropriate UI:

    - **Text**: The message text is displayed using the `Message` and `MessageContent` components.
    - **Reasoning**: If the message contains reasoning, the **Reasoning** component is used to display it.
    - **Actions**: If the message is from the assistant and is the last one, the actions "Retry" and "Copy" are displayed below it.

      - "Retry" regenerates the response.
      - "Copy" copies the response to the clipboard.

#### Input Section:

- **`<PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>`**:

  - This is the input area where the user can type messages, attach files, and submit them.
  - **`onSubmit={handleSubmit}`**: When the user submits the input, the `handleSubmit` function is called.
  - **`globalDrop` and `multiple`**: These allow users to drag and drop files and allow multiple files to be uploaded.

- **`<PromptInputBody>`**: Contains the body of the input area:

  - **`<PromptInputAttachments>`**: This displays attached files if any are added by the user.
  - **`<PromptInputTextarea>`**: This is the text area for the user to type their input. It updates the **`input`** state on change.

- **`<PromptInputToolbar>`**: This section contains additional tools or actions that can be used in the input area:

  - **`<PromptInputTools>`**: A wrapper for different tools (e.g., buttons, menus).

    - **`<PromptInputActionMenu>`**: A menu for additional actions (e.g., adding attachments).
    - **`<PromptInputButton>`**: A button to toggle the **web search** state when clicked.

      - The button's appearance changes based on the **`webSearch`** state (default or ghost style).

    - **`<PromptInputModelSelect>`**: A dropdown to select the AI model (GPT 4o or Deepseek R1). The current selected model is controlled by the **`model`** state.

- **`<PromptInputSubmit>`**: This is the submit button that sends the message. It is disabled if the input is empty or if the assistant is still processing (`status`).

#### Loader:

- If the assistant's status is **'submitted'** (indicating the message is being processed), a **Loader** component is shown, displaying a loading animation.

### Key Features:

- **Message Handling**: The component dynamically updates the UI based on the messages' content (text, reasoning, sources).
- **Web Search Toggle**: The "Search" button allows the user to toggle whether the assistant should use web search when generating responses.
- **Model Selection**: Users can switch between different AI models (e.g., GPT 4o or Deepseek R1) using a dropdown.
- **Attachments**: Users can attach files with their messages, and these are handled and displayed in the UI.

### Final Behavior:

- The user can type a message, choose a model, toggle web search, attach files, and submit the message.
- The assistant will process the message and respond, with the response rendered in real-time, including any reasoning, external sources, and actions like "Retry" or "Copy".

## **********************\*\*\*\*********************** Server Side ************************************\*\*\*************************************+\*\*\*

Let's break down the **syntax** of the code to understand how it's structured, focusing on JavaScript and TypeScript concepts used in this code:

---

### 1. **Imports**

```typescript
import { streamText, UIMessage, convertToModelMessages } from "ai";
```

- **`import { ... }`**: This is an **ES6** syntax for importing specific functions, classes, or variables from a module. In this case, it’s importing `streamText`, `UIMessage`, and `convertToModelMessages` from the module `'ai'`.
- **`from 'ai'`**: Refers to the source of the imported module. This could be a file or a package named `ai`.

---

### 2. **Constant Declaration**

```typescript
export const maxDuration = 30;
```

- **`const`**: This is a keyword used to declare a constant variable. In JavaScript/TypeScript, a constant cannot be reassigned after its initialization.
- **`maxDuration`**: The name of the constant.
- **`= 30`**: The value assigned to the constant `maxDuration`. This constant will hold the value `30`, which represents the maximum allowed duration for streaming responses in seconds.
- **`export`**: The `export` keyword makes this constant accessible outside of the current module. This allows other parts of the application to import and use it.

---

### 3. **Asynchronous Function Declaration**

```typescript
export async function POST(req: Request) {
```

- **`async`**: This keyword declares an asynchronous function, meaning that it will return a `Promise` and allows the use of `await` inside the function.
- **`function POST(req: Request)`**: Defines a function named `POST`. This function handles HTTP `POST` requests and takes a parameter `req`, which represents the incoming request.

  - **`req: Request`**: This specifies that `req` is of type `Request`, which is a built-in type representing an HTTP request. It’s typical in web frameworks like Express.js or other Node.js servers to handle HTTP requests.

---

### 4. **Destructuring Assignment**

```typescript
const {
  messages,
  model,
  webSearch,
}: {
  messages: UIMessage[];
  model: string;
  webSearch: boolean;
} = await req.json();
```

- **`const { ... }`**: This is a **destructuring assignment**. It allows extracting multiple properties from an object into separate variables. In this case, the `req.json()` method returns an object, and the properties `messages`, `model`, and `webSearch` are extracted into their own variables.

- **`: { ... }`**: This specifies the type of the object being destructured. It’s a TypeScript feature that provides type annotations to variables.

  - **`messages: UIMessage[]`**: Declares `messages` as an array of `UIMessage` objects (presumably a custom type representing a message in the UI).
  - **`model: string`**: Declares `model` as a string (representing the AI model's name).
  - **`webSearch: boolean`**: Declares `webSearch` as a boolean, indicating whether the model should perform web searches.

- **`await req.json()`**: The `req.json()` function returns a `Promise` that resolves with the parsed JSON object from the request body. Since the function is asynchronous, `await` is used to wait for the promise to resolve and extract the data.

---

### 5. **Calling `streamText`**

```typescript
const result = streamText({
  model: webSearch ? "perplexity/sonar" : model,
  messages: convertToModelMessages(messages),
  system:
    "You are a helpful assistant that can answer questions and help with tasks",
});
```

- **`const result = streamText({...})`**: This calls the `streamText` function and assigns its result to the constant `result`.

  - **`streamText({...})`**: This is the function being called, and it's passed an object as an argument.
  - **`model: webSearch ? 'perplexity/sonar' : model`**: This is a **ternary operator**, which is a shorthand for an `if-else` statement. It checks if `webSearch` is `true`:

    - If `true`, it uses `'perplexity/sonar'` as the model.
    - If `false`, it uses the model passed in the request (`model`).

  - **`messages: convertToModelMessages(messages)`**: The `convertToModelMessages` function is used to transform the `messages` array into a format compatible with the AI model.
  - **`system: 'You are a helpful assistant...'`**: This is a system message that provides the context for the assistant's behavior.

---

### 6. **Return Response**

```typescript
return result.toUIMessageStreamResponse({
  sendSources: true,
  sendReasoning: true,
});
```

- **`return`**: This returns the result of `result.toUIMessageStreamResponse({...})`, which will be sent back to the client.

  - **`result.toUIMessageStreamResponse({...})`**: Calls the `toUIMessageStreamResponse` method on the `result` object, which likely formats the AI-generated response into a UI-compatible format.
  - **`sendSources: true`**: This option indicates that the response should include any external sources used by the assistant.
  - **`sendReasoning: true`**: This option ensures that any reasoning behind the assistant’s response is included in the streamed response.

---

### Summary of Syntax:

- **`async` and `await`**: Used for handling asynchronous operations in a more readable manner.
- **Destructuring**: Used to extract values from an object directly into variables.
- **Ternary Operator**: A concise way to perform conditional logic (`condition ? valueIfTrue : valueIfFalse`).
- **TypeScript Type Annotations**: Declares the types of variables and function parameters to improve type safety.
- **Return Values**: Returning a stream response with options for sending extra data like reasoning and sources.

This code is typical for building a backend API endpoint that interacts with an AI model, streams responses, and returns data in real time. The use of TypeScript ensures strong typing and better development experience.
