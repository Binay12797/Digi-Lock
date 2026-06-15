import React, { useState } from 'react';

const Dashboard = () => {
  // State to handle navigation switching
  const [activeTab, setActiveTab] = useState('Overview');

  // Mock Data
  const navigation = ['Overview', 'Analytics', 'Customers', 'Settings'];
  
  const stats = [
    { title: 'Total Revenue', value: '$48,250' },
    { title: 'Active Users', value: '3,642' },
    { title: 'New Signups', value: '+180' },
    { title: 'Conversion Rate', value: '12.4%' },
  ];

  const recentOrders = [
    { id: '#1024', customer: 'Alice Johnson', status: 'Completed', amount: '$120.00' },
    { id: '#1023', customer: 'Bob Smith', status: 'Pending', amount: '$85.50' },
    { id: '#1022', customer: 'Charlie Brown', status: 'Refunded', amount: '$45.00' },
  ];

  return (
    <div>
      {/* Sidebar Navigation */}
      <aside>
        <h2>DevBoard</h2>
        <nav>
          <ul>
            {navigation.map((item) => (
              <li key={item}>
                <button 
                  onClick={() => setActiveTab(item)}
                  disabled={activeTab === item}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <hr />

      {/* Main Content Window */}
      <div className="main-window">
        {/* Top Header */}
        <header>
          <h1>{activeTab}</h1>
          <div>
            <span>John Doe (Admin)</span>
          </div>
        </header>

        <hr />

        {/* Dashboard Body */}
        <main>
          {activeTab === 'Overview' ? (
            <>
              {/* Stats Summary Panel */}
              <section>
                <h3>Quick Stats</h3>
                <ul>
                  {stats.map((stat, index) => (
                    <li key={index}>
                      <strong>{stat.title}:</strong> {stat.value}
                    </li>
                  ))}
                </ul>
              </section>

              <hr />

              {/* Data Table */}
              <section>
                <h3>Recent Activity</h3>
                <table border="1">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.status}</td>
                        <td>{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : (
            /* Fallback View for other tabs */
            <section>
              <h3>{activeTab} Content</h3>
              <p>This is the placeholder area for the {activeTab.toLowerCase()} view.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;