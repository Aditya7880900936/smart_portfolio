"use client"
import React, { useState } from 'react';
import { BarChart3, Briefcase, LogIn, Menu, X, TrendingUp, Users, Activity, DollarSign } from 'lucide-react';

// Type definitions
interface Route {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface StatCard {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

interface ActivityItem {
  action: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

interface Portfolio {
  name: string;
  value: string;
  change: string;
  holdings: number;
  type: 'public' | 'private';
}

interface SectorAllocation {
  sector: string;
  percentage: number;
  color: string;
}

const Page: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const routes: Route[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'signin', label: 'Sign In', icon: LogIn }
  ];

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleRouteChange = (routeId: string): void => {
    setActiveRoute(routeId);
    setIsMobileMenuOpen(false);
  };

  const DashboardContent: React.FC = () => {
    const stats: StatCard[] = [
      { icon: DollarSign, label: 'Total Revenue', value: '$54,239', change: '+12.5%', positive: true },
      { icon: Users, label: 'Active Users', value: '2,847', change: '+8.2%', positive: true },
      { icon: TrendingUp, label: 'Growth Rate', value: '23.5%', change: '+4.1%', positive: true },
      { icon: Activity, label: 'Conversion', value: '3.2%', change: '-0.5%', positive: false }
    ];

    const activities: ActivityItem[] = [
      { action: 'New user registration', time: '2 minutes ago', type: 'success' },
      { action: 'Payment processed', time: '15 minutes ago', type: 'info' },
      { action: 'System backup completed', time: '1 hour ago', type: 'success' },
      { action: 'API rate limit reached', time: '2 hours ago', type: 'warning' }
    ];

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`text-sm font-semibold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Analytics</h2>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive charts would be rendered here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' : 
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const PortfolioContent: React.FC = () => {
    const portfolios: Portfolio[] = [
      { name: 'Tech Growth Portfolio', value: '$68,420', change: '+18.5%', holdings: 12, type: 'public' },
      { name: 'Dividend Income', value: '$35,890', change: '+8.2%', holdings: 8, type: 'public' },
      { name: 'Crypto Holdings', value: '$20,258', change: '+24.7%', holdings: 6, type: 'private' }
    ];

    const sectors: SectorAllocation[] = [
      { sector: 'Technology', percentage: 38, color: 'bg-blue-500' },
      { sector: 'Financials', percentage: 22, color: 'bg-green-500' },
      { sector: 'Healthcare', percentage: 15, color: 'bg-purple-500' },
      { sector: 'Consumer', percentage: 12, color: 'bg-orange-500' },
      { sector: 'Energy', percentage: 8, color: 'bg-yellow-500' },
      { sector: 'Other', percentage: 5, color: 'bg-gray-500' }
    ];

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Portfolio Management
          </h1>
          <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Create New Portfolio
          </button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Portfolio Value</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">$124,568</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+12.4% YTD</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Portfolios</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-sm text-gray-600">2 public, 1 private</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shared Links</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">7</div>
            <div className="text-sm text-gray-600">5 active, 2 revoked</div>
          </div>
        </div>

        {/* Portfolio List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Portfolios</h2>
          <div className="space-y-4">
            {portfolios.map((portfolio, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-900">{portfolio.name}</h3>
                  <p className="text-sm text-gray-600">{portfolio.holdings} holdings • {portfolio.type}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{portfolio.value}</div>
                  <div className="text-sm text-green-600 font-medium">{portfolio.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sector Allocation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sectors.map((sector, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${sector.color}`} />
                <div>
                  <p className="font-medium text-gray-900">{sector.sector}</p>
                  <p className="text-sm text-gray-600">{sector.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SignInContent: React.FC = () => {
    const handleSubmit = (): void => {
      // Handle form submission
      console.log('Form submitted');
    };

    return (
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button className="text-sm text-purple-600 hover:text-purple-500 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button className="text-purple-600 hover:text-purple-500 font-medium transition-colors">
                Sign up here
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">Or continue with</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-700">GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = (): React.ReactNode => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardContent />;
      case 'portfolio':
        return <PortfolioContent />;
      case 'signin':
        return <SignInContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleRouteChange(route.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeRoute === route.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <route.icon className="w-5 h-5" />
                  <span className="font-medium">{route.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/90 backdrop-blur-sm border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleRouteChange(route.id)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeRoute === route.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <route.icon className="w-5 h-5" />
                  <span className="font-medium">{route.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Page;