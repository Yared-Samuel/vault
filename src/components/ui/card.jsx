import * as React from "react";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`} {...props} />
));
Card.displayName = "Card";

function CardHeader({ className, ...props }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <h3 className={`font-semibold leading-none tracking-tight text-lg ${className || ''}`} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={`p-6 pt-0 ${className || ''}`} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };