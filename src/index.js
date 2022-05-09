const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.some(user => user.username === username);

  if (!userExists) {
    return response.status(404).json({ error: 'User does not exist!' });
  }

  next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some(item => item.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' });
  }

  const user = {
    id: uuidv4(),
    username,
    name,
    todos: [],
  }

  users.push(user);

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const userIndex = users.findIndex(user => user.username === username);
  
  users[userIndex].todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex(item => item.username === username);
  const user = users[userIndex];

  const toDo = user.todos.find(item => item.id === id);

  if (!toDo) {
    return response.status(404).json({ error: 'Todo does not exist!' });
  }

  const updatedToDo = {
    ...toDo,
    title,
    deadline: new Date(deadline),
  };

  const updatedToDos = user.todos.map(item => {
    if (item.id === id) {
      return updatedToDo;
    }

    return item;
  });

  user.todos = updatedToDos;

  users[userIndex] = user;

  return response.json(updatedToDo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex(item => item.username === username);
  const user = users[userIndex];

  const toDo = user.todos.find(item => item.id === id);

  if (!toDo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  const updatedTodo = {
    ...toDo,
    done: true,
  };

  const updatedToDos = user.todos.filter(item => {
    if (item.id === id) {
      return updatedTodo;
    }

    return item;
  });

  user.todos = updatedToDos;

  users[userIndex] = user;

  return response.json(updatedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex(item => item.username === username);
  const user = users[userIndex];

  const toDo = user.todos.find(item => item.id === id);

  if (!toDo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  const updatedToDos = user.todos.filter(item => item.id !== id);

  user.todos = updatedToDos;

  users[userIndex] = user;

  return response.status(204).send();
});

module.exports = app;