# AnimationViewer
A programm created with three.js and node.js to view animations in a browser.

<h2>Description</h2>
This project is a website which makes it possible to upload and view treedimensional animations in the browser.
It is based on node.js, mongo.db and three.js.

Features:
- Uploading new animations
- Viewing the Animation in different Viewports (1 - 4)
- Adding lights to the scene
- Navigating in the time of the Animation

<h2>Installation</h2>

To install the programm you have to do different steps.

At first you have to install node.js and monogo.db.

The tested node.js-version can be downloaded <a href="https://nodejs.org/dist/v0.12.7/x64/node-v0.12.7-x64.msi">here</a>!
The tested mongo.db can be downloaded <a href=https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-3.0.4-signed.msi?_ga=1.49433254.1023123016.1437236500"">here</a>!
Than use the cmd to switch to the folder, where this project is stored and execute <strong>"npm update"</strong> to install all dependencies.

<h2>Usage</h2>
To run the server and the database this project includes a <strong>"start.bat"</strong>-file which shall be executed.
After the server and the database are running the website iteself can be found under <strong>"localhost:3000/AnimationViewer"</strong>. The first page will ask for a username and a password.
The default-username and password are:</br>
Username: <strong>admin</strong></br>
Password: <strong>passwordtest</strong></br>

At the moment no other user are availible and it in not possible to create a new one by using the webinferface.

<h2>Creation of compatible animations</h2>
The creation of animations is quite complicated.
The following tutorials where used to create proper animations:</br>
<a href="http://www.google.de/imgres?imgurl=http://www.kadrmasconcepts.com/blog/wp-content/uploads/2012/01/rendered-lamp.png&imgrefurl=http://www.kadrmasconcepts.com/blog/2012/01/24/from-blender-to-threefab-exporting-three-js-morph-animations/&h=540&w=960&tbnid=cIRhuoZNBXeTBM:&tbnh=90&tbnw=160&usg=__51hS4CXfLufxx91K6PgHRy86vp8=&docid=Or4ggzNq3p72yM">Creating a lamp-animation</a></br>
<a href="http://blog.romanliutikov.com/post/60461559240/rigging-and-skeletal-animation-in-three-js">Creation of an animated bending bar</a>
