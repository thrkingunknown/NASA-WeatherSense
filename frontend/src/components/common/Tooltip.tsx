import { useState, useRef, useEffect } from "react";
import "./Tooltip.css";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  maxWidth?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  maxWidth = "250px",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = -tooltipRect.height - 8;
          left = (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = triggerRect.height + 8;
          left = (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          top = (triggerRect.height - tooltipRect.height) / 2;
          left = -tooltipRect.width - 8;
          break;
        case "right":
          top = (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.width + 8;
          break;
      }

      setTooltipStyle({ top, left });
    }
  }, [isVisible, position]);

  const handleShow = () => setIsVisible(true);
  const handleHide = () => setIsVisible(false);

  return (
    <span
      className="tooltip-wrapper"
      ref={triggerRef}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
    >
      <span
        className="tooltip-trigger"
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? "tooltip-content" : undefined}
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          className={`tooltip-content ${position}`}
          style={{ ...tooltipStyle, maxWidth }}
          role="tooltip"
        >
          {content}
          <div className={`tooltip-arrow ${position}`}></div>
        </div>
      )}
    </span>
  );
}
