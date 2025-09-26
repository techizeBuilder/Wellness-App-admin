import React from 'react';

const Card = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = 'text-primary-900',
  iconBg = 'bg-primary-100',
  trend,
  trendIcon: TrendIcon,
  trendColor = 'text-green-600',
  onClick,
  className = '',
  children 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-soft p-4 card-hover cursor-pointer
        ${onClick ? 'hover:shadow-medium' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children ? (
        children
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {Icon && (
                <div className={`p-3 rounded-lg ${iconBg} ${iconColor}`}>
                  <Icon size={24} />
                </div>
              )}
              <div className={Icon ? "ml-4" : ""}>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {value}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          {(subtitle || trend) && (
            <div className="mt-3 flex items-center justify-between">
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
              {trend && (
                <div className={`flex items-center ${trendColor}`}>
                  {TrendIcon && <TrendIcon size={16} className="mr-1" />}
                  <span className="text-sm font-medium">{trend}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Predefined Card Types
export const StatsCard = ({ title, value, change, changeType = 'positive', icon: Icon }) => (
  <Card
    title={title}
    value={value}
    icon={Icon}
    trend={change}
    trendColor={changeType === 'positive' ? 'text-green-600' : 'text-red-600'}
  />
);

export const MetricCard = ({ title, value, subtitle, color = 'primary' }) => {
  const colorClasses = {
    primary: { iconBg: 'bg-primary-100', iconColor: 'text-primary-900' },
    gold: { iconBg: 'bg-gold-100', iconColor: 'text-gold-600' },
    coral: { iconBg: 'bg-coral-100', iconColor: 'text-coral-600' },
    green: { iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    red: { iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  };

  return (
    <Card
      title={title}
      value={value}
      subtitle={subtitle}
      iconBg={colorClasses[color]?.iconBg}
      iconColor={colorClasses[color]?.iconColor}
    />
  );
};

export default Card;