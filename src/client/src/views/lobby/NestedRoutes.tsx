import { Router, useLocation, useRouter } from "wouter";

const NestedRoutes = (props: any) => {
  const router = useRouter();
  const [location] = useLocation();

  if (!location.startsWith(props.base)) return null;

  // we need key to make sure the router will remount if the base changes
  return (
    <Router base={props.base} key={props.base} parent={router}>
      {props.children}
    </Router>
  );
};

export default NestedRoutes;
