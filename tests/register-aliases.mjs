import { registerHooks } from "node:module";

// Match the app's @/ alias without introducing a separate test toolchain.
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier.startsWith("@/")) {
			return nextResolve(
				new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href,
				context,
			);
		}
		return nextResolve(specifier, context);
	},
});
