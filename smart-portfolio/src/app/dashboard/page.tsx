import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Portfolio, Holding, SharedPortfolioAccess } from '@prisma/client';
import { Card, Metric, Text, Title, BarList, Flex, Grid, DonutChart, AreaChart, Badge, Button, Icon } from '@tremor/react';
import { FiRefreshCw, FiShare2, FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';

type DashboardProps = {
  portfolios: (Portfolio & {
    holdings: Holding[];
    sharedAccess: SharedPortfolioAccess[];
  })[];
};

export default function Dashboard({ portfolios }: DashboardProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'sharing'>('overview');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);

  // Calculate aggregate metrics
  const totalValue = portfolios.reduce((sum, portfolio) => {
    return sum + portfolio.holdings.reduce((holdSum, holding) => holdSum + ((holding.currentPrice || 0) * holding.quantity), 0);
  }, 0);

  const sharedLinksCount = portfolios.reduce((sum, portfolio) => sum + portfolio.sharedAccess.length, 0);
  const activeLinksCount = portfolios.reduce((sum, portfolio) => 
    sum + portfolio.sharedAccess.filter(access => !access.isRevoked).length, 0);

  // Sample data for charts
  const sectorData = [
    { name: 'Technology', value: 38 },
    { name: 'Financials', value: 22 },
    { name: 'Healthcare', value: 15 },
    { name: 'Consumer', value: 12 },
    { name: 'Energy', value: 8 },
    { name: 'Other', value: 5 },
  ];

  const performanceData = [
    { date: 'Jan 1', value: 100000 },
    { date: 'Feb 1', value: 105000 },
    { date: 'Mar 1', value: 110000 },
    { date: 'Apr 1', value: 115000 },
    { date: 'May 1', value: 120000 },
    { date: 'Jun 1', value: 124568 },
  ];

  const topHoldings = [
    { name: 'AAPL', value: 42000 },
    { name: 'MSFT', value: 38000 },
    { name: 'GOOGL', value: 22000 },
    { name: 'AMZN', value: 18000 },
    { name: 'TSLA', value: 15000 },
  ];

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <Title>Portfolio Dashboard</Title>
          <Text>Welcome back, {session?.user?.name || 'User'}</Text>
        </div>
        <Button 
          icon={FiRefreshCw} 
          variant="light" 
          loading={loading}
          onClick={refreshData}
        >
          Refresh Data
        </Button>
      </header>

      <nav className="dashboard-tabs">
        <Button 
          variant={activeTab === 'overview' ? 'primary' : 'light'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={activeTab === 'performance' ? 'primary' : 'light'}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </Button>
        <Button 
          variant={activeTab === 'sharing' ? 'primary' : 'light'}
          onClick={() => setActiveTab('sharing')}
        >
          Sharing Analytics
        </Button>
      </nav>

      {activeTab === 'overview' && (
        <Grid numItems={2} numItemsLg={3} className="gap-6 mt-6">
          <Card>
            <Text>Total Portfolio Value</Text>
            <Metric>${totalValue.toLocaleString()}</Metric>
            <Flex justifyContent="start" className="mt-4">
              <Badge color="emerald">+12.4% YTD</Badge>
            </Flex>
          </Card>

          <Card>
            <Text>Number of Portfolios</Text>
            <Metric>{portfolios.length}</Metric>
            <Button icon={FiPlus} variant="light" className="mt-4">
              Create New
            </Button>
          </Card>

          <Card>
            <Text>Active Shared Links</Text>
            <Metric>{activeLinksCount}</Metric>
            <Text>out of {sharedLinksCount} total</Text>
          </Card>

          <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <Title>Sector Allocation</Title>
            <DonutChart
              data={sectorData}
              category="value"
              index="name"
              colors={['blue', 'violet', 'fuchsia', 'rose', 'amber', 'emerald']}
              className="mt-6"
            />
          </Card>

          <Card className="col-span-1 md:col-span-2">
            <Title>Top Holdings</Title>
            <BarList
              data={topHoldings.map(holding => ({
                name: holding.name,
                value: holding.value,
              }))}
              className="mt-4"
            />
          </Card>
        </Grid>
      )}

      {activeTab === 'performance' && (
        <div className="mt-6">
          <Card>
            <Title>Portfolio Performance</Title>
            <AreaChart
              data={performanceData}
              categories={['value']}
              index="date"
              colors={['blue']}
              valueFormatter={(value: number) => `$${value.toLocaleString()}`}
              className="h-72 mt-6"
            />
          </Card>

          <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
            <Card>
              <Title>Best Performers</Title>
              <BarList
                data={[
                  { name: 'AAPL', value: 24.5 },
                  { name: 'MSFT', value: 18.2 },
                  { name: 'GOOGL', value: 12.7 },
                ].map(item => ({
                  ...item,
                  value: item.value,
                  name: `${item.name} (${item.value}%)`
                }))}
                className="mt-4"
                color="emerald"
              />
            </Card>

            <Card>
              <Title>Worst Performers</Title>
              <BarList
                data={[
                  { name: 'TSLA', value: -15.2 },
                  { name: 'AMZN', value: -8.4 },
                  { name: 'NVDA', value: -5.7 },
                ].map(item => ({
                  ...item,
                  value: Math.abs(item.value),
                  name: `${item.name} (${item.value}%)`
                }))}
                className="mt-4"
                color="rose"
              />
            </Card>
          </Grid>
        </div>
      )}

      {activeTab === 'sharing' && (
        <div className="mt-6">
          <Card>
            <Title>Shared Portfolio Links</Title>
            <div className="overflow-x-auto">
              <table className="w-full mt-4">
                <thead>
                  <tr>
                    <th className="text-left">Portfolio</th>
                    <th className="text-left">Access Type</th>
                    <th className="text-left">Views</th>
                    <th className="text-left">Last Accessed</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolios.flatMap(portfolio => 
                    portfolio.sharedAccess.map(access => (
                      <tr key={access.id}>
                        <td>{portfolio.name}</td>
                        <td>
                          <Badge color={access.isRevoked ? 'red' : 'emerald'}>
                            {access.isRevoked ? 'Revoked' : 'Active'}
                          </Badge>
                        </td>
                        <td>{access.viewCount || 0}</td>
                        <td>
                          {access.lastViewedAt ?
                            new Date(access.lastViewedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="text-right">
                          <Button icon={FiEye} variant="light" size="xs">
                            View
                          </Button>
                          <Button icon={FiShare2} variant="light" size="xs" className="ml-2">
                            Share
                          </Button>
                          <Button icon={FiTrash2} variant="light" size="xs" color="red" className="ml-2">
                            Revoke
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
            <Card>
              <Title>Link Activity</Title>
              <AreaChart
                data={[
                  { date: 'Jan', views: 12 },
                  { date: 'Feb', views: 18 },
                  { date: 'Mar', views: 25 },
                  { date: 'Apr', views: 32 },
                  { date: 'May', views: 28 },
                  { date: 'Jun', views: 42 },
                ]}
                categories={['views']}
                index="date"
                colors={['violet']}
                className="h-72 mt-6"
              />
            </Card>

            <Card>
              <Title>Top Viewed Portfolios</Title>
              <BarList
                data={portfolios
                  .filter(p => p.sharedAccess.some(a => a.viewCount > 0))
                  .map(p => ({
                    name: p.name,
                    value: p.sharedAccess.reduce((sum, a) => sum + (a.viewCount || 0), 0),
                  }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                }
                className="mt-6"
              />
            </Card>
          </Grid>
        </div>
      )}
    </div>
  );
}