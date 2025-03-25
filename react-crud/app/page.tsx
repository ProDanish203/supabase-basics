"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";
import { Loader2Icon, TrashIcon } from "lucide-react";

type Todo = {
  id: number;
  created_at: Date;
  text: string;
  isCompleted: boolean;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getTodos = async () => {
    const { data, error } = await supabase.from("Todos").select("*");
    if (error) {
      setIsLoading(false);
      return toast.error(error.message);
    }
    if (data) setTodos(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getTodos();
  }, []);

  const addTodo = async () => {
    if (inputValue.trim() === "")
      return toast.error("Todo text cannot be empty");

    const newTodo = {
      text: inputValue,
      isCompleted: false,
    };

    const { data, error } = await supabase
      .from("Todos")
      .insert([newTodo])
      .select()
      .single();
    if (error) return toast.error(error.message);
    if (data) {
      setTodos([...todos, data]);
      setInputValue("");
    }
  };

  const toggleTodoStatus = async (id: number, status: boolean) => {
    const { data, error } = await supabase
      .from("Todos")
      .update({ isCompleted: !status })
      .match({ id })
      .select();
    console.log(data);
    if (error) return toast.error(error.message);
    if (data && data.length > 0)
      setTodos(todos.map((todo) => (todo.id === id ? data[0] : todo)));
  };

  const deleteTodo = async (id: number) => {
    const { data, error } = await supabase
      .from("Todos")
      .delete()
      .match({ id })
      .select();
    if (error) return toast.error(error.message);
    if (data && data.length > 0) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Todo List</h1>

      <div className="flex gap-2 mb-8">
        <Input
          placeholder="Add a new todo..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTodo();
            }
          }}
          className="flex-1"
        />
        <Button onClick={addTodo}>Add</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2Icon className="animate-spin w-6 h-6 text-neutral-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {todos.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No todos yet. Add one above!
            </p>
          ) : (
            todos.map((todo) => (
              <Card
                key={todo.id}
                className={`shadow-sm ${
                  todo.isCompleted
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                    : ""
                }`}
              >
                <CardContent className="px-4 py-0">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={todo.id.toString()}
                      checked={todo.isCompleted}
                      onCheckedChange={() =>
                        toggleTodoStatus(todo.id, todo.isCompleted)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-x-2">
                        <p
                          className={`${
                            todo.isCompleted
                              ? "line-through text-muted-foreground"
                              : ""
                          } cursor-pointer`}
                          onClick={() =>
                            toggleTodoStatus(todo.id, todo.isCompleted)
                          }
                        >
                          {todo.text}
                        </p>
                        <Button
                          onClick={() => deleteTodo(todo.id)}
                          variant={"outline"}
                          size={"icon"}
                          className="cursor-pointer"
                        >
                          <TrashIcon size={12} className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          ID: {todo.id.toString().substring(0, 8)}...
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Created:{" "}
                          {format(todo.created_at, "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
