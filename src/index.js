const express = require('express');
const cors = require('cors');
const {v4: uuidv4} = require('uuid');
const { v4 } = require('uuid');


// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  
  const user = users.find(u => u.username === username)

  if (!user) {
    return response.status(400).json('The user does not exists.')
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExist = users.some(u => u.username === username)

  if (userExist) {
    return response.status(400).json({error: 'The username already exists.'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }
    
  users.push(user)

  return response.status(200).json(user)
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user
  
  return response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const user = request.user

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()

  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const user = request.user

  const todo = user.todos.find(t => t.id === id)

  if (!todo) {
    return response.status(404).json({error: 'The todo id does not exists.'})
  }

  const {title, deadline} = request.body

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(200).json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const user = request.user

  const todo = user.todos.find(t => t.id === id)

  if (!todo) {
    return response.status(404).json({error: 'The todo id does not exists.'})
  }

  todo.done = true

  return response.status(200).json(todo)
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const user = request.user

  const todo = user.todos.find(t => t.id === id)

  if (!todo) {
    return response.status(404).json({error: 'The todo id does not exists.'})
  }

  user.todos.splice(user.todos.indexOf(todo), 1)

  return response.status(204).json(user)
});

module.exports = app;
