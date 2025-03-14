## Getting Started
- Clone the repo
- make sure you have [ddev](https://ddev.readthedocs.io/en/stable/) and [docker](https://www.docker.com/products/docker-desktop/) installed
- Start up docker
- run `ddev start`
- run `ddev npm install`
- run `ddev composer install`
- run `pull-db-from-prod`
- run `ddev npm run dev`
- run `ddev launch`


## JS
- This site uses [vite](https://vitejs.dev/) to run a dev server as well as build for production
- vite is included in craft via a [plugin](https://nystudio107.com/blog/using-vite-js-next-generation-frontend-tooling-with-craft-cms)
- the plugins entrypoint is in the `head` template. 
    - the entrypoint will load the js and css 
- For legacy browsers, the build step will automatically convert the codesplit js into one single package
-  node_packages is needed for gsap-bonus.tgz, which is then used in the build step during a deploy.
### GSAP
- to install gsap, run `ddev npm install ./node_packages/gsap-bonus.tgz`

## CSS/SCSS
If you add a file to the `components` section of scss, you will need to restart vite for it to auto import it. alternatively, import components explicitly and remove the glob import.

## Committed Images
- Since images uploaded via craft get their own subfolder on the CDN based on environment (see servd docs), we commit images that we need to reference via css (without doing a db query). The images are put in `web/assets/public`. 


## Twig
- we try our best to eager load db queries, and cache globally for things such as global nav.

