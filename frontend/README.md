# Digital Bilderrahmen - About the project
// TODO: Add Content. 

## Warning:
At one point, when trying to solve the CORS issue an error 
>[!Warning]
>```bash
>Property 'ɵassertType' does not exist on type 'typeof import("c:/Users/Jackson Smith/.vscode/Projekte/>bilderrahmen/frontend/node_modules/@angular/core/index")'.ngtsc(2339)
>gallery.component.ts(12, 16): Error occurs in the template of component GalleryComponent.
>```
>appeard (even though i did not touch that part of the code) in gallery.component.html and now device-settings.component.html as well (onHighlightImageSelection()). After some troubleshooting only switching strictTemplates to false made the error go away. Copilot things that it might be an Angular Version issue. 


## Built with: 
- Angular.
- HTML.
- CSS.
- Bootstrap.
- Probably something else as well. 
  
# Getting Started
## Prerequisite
Certain software has to be installed before starting: 
- [Node.js und npm](https://nodejs.org/) 
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
- NgRx (installing it not globally): `npx -p @angular/cli ng add @ngrx/store @ngrx/effects @ngrx/store-devtools @ngrx/reducers @ngrx/actions`



## Things to install
### npm
To install node_modules (which is required because it gives you the libraries (project dependencies)):
```bash
npm install
```

## Development server

To start a local development server, run:

```bash
ng serve
```
or 

```bash
npm start
```
Both essentially do the same thing. 

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

