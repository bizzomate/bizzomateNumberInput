import { FunctionComponent, createElement } from "react";
import classNames from "classnames";
export interface AlertProps {
    alertStyle?: "default" | "primary" | "success" | "info" | "warning" | "danger";
    className?: string;
    children?: any;
}
export const Alert: FunctionComponent<AlertProps> = ({ alertStyle, className, children }) =>
    children ? (
        <div className={classNames(`alert alert-${alertStyle} mx-validation-message`, className)}>{children}</div>
    ) : null;
Alert.displayName = "Alert";
Alert.defaultProps = { alertStyle: "danger" };
