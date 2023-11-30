import { Router, RouterProps, Switch, useRoute } from 'wouter';
import SideBar from '.';

export default function SidebarWithRouter({ children, ...props }: RouterProps) {
  const [matches] = useRoute((props.base || '/') + '/' + ':rest*');
  console.log(matches, (props.base || '/') + '/' + ':rest*');

  if (!matches) return null;
  return (
    <Router {...props}>
      <Switch>
        {children}
        {/* <Route path="/error">
            <ErrorPage />
          </Route>
          <Route>
            <Redirect to="/error?t=404" />
          </Route> */}
      </Switch>
      <SideBar />
    </Router>
  );
}
