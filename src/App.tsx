import React, { useReducer, useState, useEffect } from "react";
import "./App.css"; // Ensure you update your CSS accordingly.

type ActionType =
  | { type: "add"; text: string }
  | { type: "delete"; id: number }
  | { type: "complete"; id: number }
  | { type: "update"; id: number; text: string }
  | { type: "clearCompleted" };

interface Todo {
  id: number;
  text: string;
  isCompleted: boolean;
}

function todoReducer(state: Todo[], action: ActionType) {
  switch (action.type) {
    case "add":
      return [
        { id: state.length, text: action.text, isCompleted: false },
        ...state,
      ];
    case "delete":
      return state.filter((todo) => todo.id !== action.id);
    case "complete":
      return state.map((todo) =>
        todo.id === action.id
          ? { ...todo, isCompleted: !todo.isCompleted }
          : todo
      );
    case "update":
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, text: action.text } : todo
      );
    case "clearCompleted":
      return state.filter((todo) => !todo.isCompleted);
    default:
      return state;
  }
}

const App: React.FC = () => {
  const [todos, dispatch] = useReducer(todoReducer, [], () => {
    const localData = localStorage.getItem("todos");
    return localData ? JSON.parse(localData) : [];
  });
  const [text, setText] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const handleAddOrUpdate = () => {
    if (editId !== null) {
      dispatch({ type: "update", id: editId, text });
      setEditId(null);
    } else {
      dispatch({ type: "add", text });
    }
    setText("");
  };

  const handleEdit = (todo: Todo) => {
    setText(todo.text);
    setEditId(todo.id);
  };

  const completedCount = todos.filter((todo) => todo.isCompleted).length;

  return (
    <div className="app">
      <div className="header">
        TODO
        <svg onClick={() => {}} width="26" height="26">
          {" "}
          {/* Add the dark mode icon here */}
          <path
            fill="#FFF"
            fill-rule="evenodd"
            d="M13 0c.81 0 1.603.074 2.373.216C10.593 1.199 7 5.43 7 10.5 7 16.299 11.701 21 17.5 21c2.996 0 5.7-1.255 7.613-3.268C23.22 22.572 18.51 26 13 26 5.82 26 0 20.18 0 13S5.82 0 13 0z"
          />
        </svg>
      </div>
      <div className="input-container">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Create a new todo..."
        />
        <button onClick={handleAddOrUpdate}>
          {editId !== null ? "Update Todo" : "Add Todo"}
        </button>
      </div>
      <div className="todo-list">
        {todos.map((todo, _index) => (
          <div key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.isCompleted}
              onChange={() => dispatch({ type: "complete", id: todo.id })}
            />
            <span
              style={{
                textDecoration: todo.isCompleted ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => handleEdit(todo)}>Update</button>
            <button onClick={() => dispatch({ type: "delete", id: todo.id })}>
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="footer">
        <span>{todos.length} items left</span>
        <span>{completedCount} completed</span>
        <button onClick={() => dispatch({ type: "clearCompleted" })}>
          Clear Completed
        </button>
      </div>
    </div>
  );
};

export default App;
