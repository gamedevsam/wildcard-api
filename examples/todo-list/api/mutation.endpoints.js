const { endpoints } = require("@wildcard-api/server");
const db = require("../db");
const { getLoggedUser } = require("../auth");

// We tailor mutation endpoints to the frontend as well

endpoints.toggleComplete = async function (todoId) {
  const user = await getLoggedUser(this.headers);
  // Do nothing if user is not logged in
  if (!user) return;

  const todo = await getTodo(todoId);
  // Do nothing if todo not found.
  // (This can happen since `toggleComplete` is essentially public and anyone
  // on the internet can "call" it with an arbitrary `todoId`.)
  if (!todo) return;

  // Do nothing if the user is not the author of the todo
  if (todo.authorId !== user.id) return;

  const completed = !todo.completed;
  await db.query(
    "UPDATE todos SET completed = :completed WHERE id = :todoId;",
    { completed, todoId }
  );

  return completed;
};

async function getTodo(todoId) {
  const [todo] = await db.query(`SELECT * FROM todos WHERE id = :todoId;`, {
    todoId,
  });
  return todo;
}
