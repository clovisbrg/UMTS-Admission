# UMTS-Admission simulator

This project aims to simulate the attribution of OVSF codes to communications entering the air interface in UMTS.

## Run in a local server
The project uses Web Workers that require a server environment to function properly due to security restrictions in web browsers. You can start a local Python server using the following command :

```python -m http.server 8000```

Once the server is running, you can access your HTML file containing the JavaScript code that uses Web Workers by navigating to http://localhost:8000/index.html in your web browser. This allows the Web Workers to be executed within the server environment, enabling parallel processing.

