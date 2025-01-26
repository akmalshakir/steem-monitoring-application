// Initialize the Steem API
steem.api.setOptions({ url: 'https://api.steemit.com' });

// Get the HTML element to display activities
const activityList = document.getElementById('activity-list');
const trendingContainer = document.getElementById('trending-accounts');

// Store chart data (for activities per minute)
let chartData = {};

// Track account activity frequency
let accountActivityCount = {};

// Function to monitor blockchain activities
function monitorBlockchain() {
  console.log('Monitoring blockchain activities...');

  steem.api.streamOperations((err, result) => {
    if (err) {
      console.error('Error streaming operations:', err);
      return;
    }

    // Extract operation type and data
    const [type, data] = result;
    const activity = {
      type,
      data,
      timestamp: new Date().toLocaleString()
    };

    // Display the activity on the webpage
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <strong class="activity-type">Type:</strong> ${type} <br>
      <strong class="activity-account">Account:</strong> ${data.from || data.author || 'Unknown'} <br>
      <strong>Details:</strong> ${JSON.stringify(data)} <br>
      <strong class="activity-timestamp">Timestamp:</strong> ${new Date().toLocaleString()}
    `;
    activityList.prepend(listItem);

    // Check for large transaction alerts
    checkForAlerts(activity);

    // Update the chart data
    updateChart(type);

    trackAccountActivity(activity);

    if (activityList.childElementCount > 20) {
      activityList.removeChild(activityList.lastChild);
    }
  });
}

// Start monitoring blockchain activities
monitorBlockchain();

// Function to check for alerts (e.g., large transaction)
function checkForAlerts(activity) {
  if (activity.type === 'transfer' && parseFloat(activity.data.amount) > 1000) {
    alert(`Large transaction detected! Amount: ${activity.data.amount}`);
  }
}

// Chart to visualize blockchain activities
const ctx = document.getElementById('activityChart').getContext('2d');
const activityChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [], // Timestamps
    datasets: [{
      label: 'Blockchain Activities',
      data: [], // Count of activities
      borderColor: 'rgba(75, 192, 192, 1)',
      fill: false
    }]
  }
});

// Function to update chart data for activities per minute
function updateChart(type) {
  const timestamp = new Date().toLocaleTimeString();
  if (!chartData[timestamp]) {
    chartData[timestamp] = 0;
  }
  chartData[timestamp] += 1;
  activityChart.data.labels = Object.keys(chartData);
  activityChart.data.datasets[0].data = Object.values(chartData);
  activityChart.update();
}

// Function to track account activity (for trending accounts)
function trackAccountActivity(activity) {
    const account = activity.data.from || activity.data.author || 'Unknown'; // Default to 'Unknown' if neither field exists
    
    // Only proceed if account is valid (not 'Unknown')
    if (account !== 'Unknown') {
      if (!accountActivityCount[account]) {
        accountActivityCount[account] = 0;
      }
      accountActivityCount[account]++;
    }
      const sortedAccounts = Object.entries(accountActivityCount)
      .sort((a, b) => b[1] - a[1])  // Sort by activity count (descending)
      .map(entry => entry[0]);  // Get the account names
      trendingContainer.innerHTML = '';
    sortedAccounts.forEach(account => {
      const listItem = document.createElement('li');
      listItem.textContent = `${account}: ${accountActivityCount[account]} activities`;
      trendingContainer.appendChild(listItem);
    });
  }
  
  
