# React Ledgex 🚀

**A lightweight, key-value state management library for React with built-in undo/redo support**

[![npm](https://img.shields.io/npm/v/react-ledgex)](https://www.npmjs.com/package/react-ledgex)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

![React Ledgex Logo](./images/banner.jpg)

---

## ✨ Features

✅ **Simple Key-Value Store** – Like `useState` but global and type-safe
✅ **Time Travel** – Built-in undo/redo functionality
✅ **Layer Support** – Isolate state changes like Photoshop layers
✅ **Tiny Bundle** – < 5KB gzipped
✅ **React Optimized** – Seamless hooks integration

---

## 🚀 Installation

```bash
npm install react-ledgex
# or
yarn add react-ledgex
```

---

## 💡 Basic Usage

### 1. Wrap your app
```jsx
import { LedgexProvider } from 'react-ledgex';

function App() {
  return (
    <LedgexProvider>
      <PhotoEditor />
    </LedgexProvider>
  );
}
```

### 2. Use anywhere
```jsx
import { useLedgex } from 'react-ledgex';

function Editor() {
  const { set, get, undo, redo, getTimeInfo } = useLedgex();
  const { canUndo, canRedo } = getTimeInfo();

  const layer = get('background');

  const handleEdit = () => {
    set('background', { color: '#202020' });
  };

  return (
    <div style={{ background: layer?.color }}>
      <button onClick={undo}>Undo</button>
    </div>
  );
}
```

---

## 🎨 Advanced Features

### Layer Isolation
```js
// Separate state for UI vs document
ledger.set({
  'ui/toolbar': { activeTool: 'brush' },
  'document': { layers: [...] }
});
```

### Batch Updates
```js
ledger.set({
  'canvas': { zoom: 1.2 },
  'selection': { active: true }
}); // Single undo/redo point
```

### Efficient History
```js
// Configure memory usage
<LedgexProvider bufferSize={100}>
  {/* Keeps last 100 states */}
</LedgexProvider>
```

### Don't Pay for empty tickets

Identical commits to the same layer won't count, thus won't affect the size of your storage.

---

## 🏆 Why Ledgex?

| Feature          | Ledgex | Redux | Zustand |
|------------------|--------|-------|---------|
| Undo/Redo        | ✅ Built-in | ❌ Middleware | ❌ Manual |
| Key-Value Store  | ✅ Native | ❌ Actions | ✅ Native |
| Layer Support    | ✅ Photoshop-style | ❌ | ❌ |
| Bundle Size      | 3.81KB | 16KB | 8KB |

---

## 💖 Support

⭐ **Star the repo** if you find it useful!
🐞 **Report issues** on GitHub

---

```txt
// Made with ❤️ by Memmou Abderrahmane
```
