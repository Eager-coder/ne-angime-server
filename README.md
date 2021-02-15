# API Documentation for Ne Angime?

## Register

Registration consists of two stages. 

### Stage 1
#### Checks if a username is unique
Endpoint : /api/auth/register?stage=1

Required body data:
>username
>firstname
>lastname


### Stage 2

Endpoint : /api/auth/register?stage=2

Required body data:
>username
>firstname
>lastname
>email
>password1
>password2

## Login

Endpoint : /api/auth/login

Required body data:
>username 
>password
