console.log("Starting simple server");
const http = require('http');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  
  // Serve a simple HTML page
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activity Tracker</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f7fa;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        header {
          background-color: #1a73e8;
          color: white;
          padding: 1rem 0;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        h1, h2, h3 {
          margin-top: 0;
          color: #1a73e8;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="header-content">
          <h1>Activity Tracker</h1>
        </div>
      </header>
      
      <div class="container">
        <div class="card">
          <h2>Welcome to Activity Tracker</h2>
          <p>
            This application helps you track your daily activities, 
            monitor your productivity, and gain insights into how you spend your time.
          </p>
          <p>Please sign in to access your personalized dashboard and timeline.</p>
        </div>
        
        <div class="card">
          <h3>Key Features</h3>
          <ul>
            <li>Track daily activities and achievements</li>
            <li>Visualize your productivity patterns</li>
            <li>Set goals and monitor progress</li>
            <li>Receive insights and recommendations</li>
            <li>Integrated with Google Calendar (coming soon)</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Listen on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('Server running at http://0.0.0.0:5000/');
});