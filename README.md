# RiteShop (Backend)

**RiteShop** is an online store like Amazon, Jumia, Takealot etc. On **RiteShop**, purchases can either be made directly by customer online or via a sales agent through the a progressive web application. The key features of the app should be able to be accessed offline in case the sales agent has no mobile signal.

Both customers or sales agent can browse, filter and search through the product catalog to find items. They can then add items to their carts and the quantities of items in the cart can be updated. 

This project is built with **NodeJS**, **TypeScript**, **ExpressJS** and **MongoDB (database)**. User authorisation and authentication will be handled with the **PassportJS** authentication middleware.
## Development

To run this project on your local machine, do the following:

- Run `git clone https://gitlab.com/deimosdev/internships/se/projects/mathilda-riteshop/riteshop-be.git` to clone this repo.
- Run `cd riteshop-be/` to navigate into the project folder.
- Run `npm i` to install all the packages.
- Copy the contents of the `env.example` file and rename to `.env`. You can change the values to setup your own database configuration.
- Start the server by running `npm start`. This command will automatically run your app on http://localhost:8000/

The frontend app of this project can be found [here](https://gitlab.com/deimosdev/internships/se/projects/mathilda-riteshop/riteshop-fe).

## Testing

Run tests with `npm test`

## API Endpoints