import type { ReactNode } from "react";

type CardHeadingProps = {
  title: string;
  titleId: string;
  description: string;
  badge: string;
  icon: ReactNode;
};

export default function CardHeading({
  title,
  titleId,
  description,
  badge,
  icon,
}: CardHeadingProps) {
  return (
    <div className="card-heading">
      <div className="metric-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="metric-heading-copy">
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>
      <span className="metric-type">{badge}</span>
    </div>
  );
}
