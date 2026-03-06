/* eslint-disable */
import type * as Router from "expo-router";

export * from "expo-router";

declare module "expo-router" {
	export namespace ExpoRouter {
		export interface __routes<T extends string | object = string> {
			hrefInputParams:
				| {
						pathname: Router.RelativePathString;
						params?: Router.UnknownInputParams;
				  }
				| {
						pathname: Router.ExternalPathString;
						params?: Router.UnknownInputParams;
				  }
				| { pathname: `/`; params?: Router.UnknownInputParams }
				| { pathname: `/login`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)/gallery`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)/albums`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)/uploads`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)/settings`; params?: Router.UnknownInputParams }
				| {
						pathname: `/album/[id]`;
						params: Router.UnknownInputParams & { id: string };
				  }
				| {
						pathname: `/photo/[id]`;
						params: Router.UnknownInputParams & { id: string };
				  }
				| { pathname: `/_sitemap`; params?: Router.UnknownInputParams };
			hrefOutputParams:
				| {
						pathname: Router.RelativePathString;
						params?: Router.UnknownOutputParams;
				  }
				| {
						pathname: Router.ExternalPathString;
						params?: Router.UnknownOutputParams;
				  }
				| { pathname: `/`; params?: Router.UnknownOutputParams }
				| { pathname: `/login`; params?: Router.UnknownOutputParams }
				| { pathname: `/(tabs)`; params?: Router.UnknownOutputParams }
				| { pathname: `/(tabs)/gallery`; params?: Router.UnknownOutputParams }
				| { pathname: `/(tabs)/albums`; params?: Router.UnknownOutputParams }
				| { pathname: `/(tabs)/uploads`; params?: Router.UnknownOutputParams }
				| { pathname: `/(tabs)/settings`; params?: Router.UnknownOutputParams }
				| {
						pathname: `/album/[id]`;
						params: Router.UnknownOutputParams & { id: string };
				  }
				| {
						pathname: `/photo/[id]`;
						params: Router.UnknownOutputParams & { id: string };
				  }
				| { pathname: `/_sitemap`; params?: Router.UnknownOutputParams };
			href:
				| Router.RelativePathString
				| Router.ExternalPathString
				| `/${`?${string}` | `#${string}` | ""}`
				| `/login${`?${string}` | `#${string}` | ""}`
				| `/(tabs)${`?${string}` | `#${string}` | ""}`
				| `/(tabs)/gallery${`?${string}` | `#${string}` | ""}`
				| `/(tabs)/albums${`?${string}` | `#${string}` | ""}`
				| `/(tabs)/uploads${`?${string}` | `#${string}` | ""}`
				| `/(tabs)/settings${`?${string}` | `#${string}` | ""}`
				| `/album/${string}${`?${string}` | `#${string}` | ""}`
				| `/photo/${string}${`?${string}` | `#${string}` | ""}`
				| `/_sitemap${`?${string}` | `#${string}` | ""}`
				| {
						pathname: Router.RelativePathString;
						params?: Router.UnknownInputParams;
				  }
				| {
						pathname: Router.ExternalPathString;
						params?: Router.UnknownInputParams;
				  }
				| { pathname: `/`; params?: Router.UnknownInputParams }
				| { pathname: `/login`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)/gallery`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)/albums`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)/uploads`; params?: Router.UnknownInputParams }
				| { pathname: `/(tabs)/settings`; params?: Router.UnknownInputParams }
				| {
						pathname: `/album/[id]`;
						params: Router.UnknownInputParams & { id: string };
				  }
				| {
						pathname: `/photo/[id]`;
						params: Router.UnknownInputParams & { id: string };
				  }
				| { pathname: `/_sitemap`; params?: Router.UnknownInputParams };
		}
	}
}
