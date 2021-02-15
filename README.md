# API Documentation for Ne Angime?

## Register

Registration consists of two stages. 

### Stage 1
#### Checks if a username is unique
Endpoint : /api/auth/register?stage=1

Request type: POST

Required body data:
>username
>firstname
>lastname


### Stage 2

Endpoint : /api/auth/register?stage=2

Request type: POST

Required body data:
>username
>firstname
>lastname
>email
>password1
>password2

## Login

Endpoint : /api/auth/login

Request type: POST
Required body data:
>username 
>password

## Chat

Endpoint : /api/chat

Request type: GET

