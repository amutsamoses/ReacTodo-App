import React, { useReducer, useEffect, useState } from "react";
import "./App.scss";
import ButtonImage from "./images/bg-desktop-dark.jpg";
export type FilterType = "all" | "active" | "completed";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type Action =
  | { type: "ADD_TODO"; payload: string }
  | { type: "TOGGLE_TODO"; payload: number }
  | { type: "EDIT_TODO"; payload: { id: number; text: string } }
  | { type: "DELETE_TODO"; payload: number }
  | { type: "CLEAR_COMPLETED" }
  | { type: "SET_FILTER"; payload: FilterType };

export interface AppState {
  todos: Todo[];
  filter: FilterType;
}

// Initial State and Reducer
const initialState: AppState = {
  todos: JSON.parse(localStorage.getItem("todos") || "[]"),
  filter: "all",
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: Date.now(), text: action.payload, completed: false },
        ],
      };
    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    case "EDIT_TODO":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        ),
      };
    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    case "CLEAR_COMPLETED":
      return { ...state, todos: state.todos.filter((todo) => !todo.completed) };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    default:
      return state;
  }
};

// Header Component
const Header = () => (
  <div className="container" style={{ backgroundImage: `url(${ButtonImage})` }}>
    <h1>Todo</h1>
  </div>
);

// Footer Component
const Footer = ({
  todos,
  dispatch,
}: {
  todos: Todo[];
  dispatch: React.Dispatch<Action>;
}) => {
  const itemsLeft = todos.filter((todo) => !todo.completed).length;
  const handleClearCompleted = () => dispatch({ type: "CLEAR_COMPLETED" });
  const setFilter = (filter: FilterType) =>
    dispatch({ type: "SET_FILTER", payload: filter });

  return (
    <footer>
      <span>{itemsLeft} items left</span>
      <button onClick={() => setFilter("all")}>All</button>
      <button onClick={() => setFilter("active")}>Active</button>
      <button onClick={() => setFilter("completed")}>Completed</button>
      <button onClick={handleClearCompleted}>Clear Completed</button>
    </footer>
  );
};

// TodoForm Component
const TodoForm = ({ dispatch }: { dispatch: React.Dispatch<Action> }) => {
  const [input, setInput] = useState("");
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    dispatch({ type: "ADD_TODO", payload: input });
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        className="todo-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Create a new todo..."
      />
    </form>
  );
};

// TodoList Component
const TodoList = ({
  todos,
  dispatch,
}: {
  todos: Todo[];
  dispatch: React.Dispatch<Action>;
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id: number) => {
    dispatch({ type: "EDIT_TODO", payload: { id, text: editText } });
    setEditingId(null);
  };

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className={`todo-item ${todo.completed ? "completed" : ""}`}
        >
          {editingId === todo.id ? (
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => saveEdit(todo.id)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit(todo.id)}
              autoFocus
            />
          ) : (
            <span
              onClick={() =>
                dispatch({ type: "TOGGLE_TODO", payload: todo.id })
              }
            >
              {todo.text}
            </span>
          )}
          <button onClick={() => handleEdit(todo.id, todo.text)}>Edit</button>
          <button
            onClick={() => dispatch({ type: "DELETE_TODO", payload: todo.id })}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

// Main App Component
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { todos, filter } = state;

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="app">
      <Header />
      <TodoForm dispatch={dispatch} />
      <TodoList todos={filteredTodos} dispatch={dispatch} />
      <Footer todos={todos} dispatch={dispatch} />
    </div>
  );
}

export default App;
