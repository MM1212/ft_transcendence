import { Route, Switch } from "wouter";
import FriendsOnline from "./FriendsOnline";

export function FriendsRoutes() : JSX.Element {
	return (
		<Switch>
		  {/* <Route path="/friends" exact component={Friends} /> */}
		  {/* <Route path="/friends/all" component={AllFriends} /> */}
		  <Route path="/friends/online" component={FriendsOnline} />
		</Switch>
	  );
	};
	