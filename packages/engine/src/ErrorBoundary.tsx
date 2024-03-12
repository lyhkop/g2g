import React, { ReactNode, useState } from "react";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

export function ErrorBoundary({ fallback, children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  function handleOnError() {
    setHasError(true);
  }

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          onError: handleOnError,
        });
      })}
    </>
  );
}
