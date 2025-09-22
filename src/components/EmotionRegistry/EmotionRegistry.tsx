"use client";

import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';

/**
 * Emotion SSR registry for Next.js App Router (React Server Components)
 *
 * - Creates a per-request emotion cache
 * - Flushes generated styles during SSR using useServerInsertedHTML
 * - Uses an insertion point meta tag to keep style order stable
 */
export default function EmotionRegistry({
	children,
}: {
	children: React.ReactNode;
}) {
	const [{ cache, flush }] = React.useState(() => {
			// Create a default cache that appends styles at the end of <head> on the client.
			// This ensures client-inserted styles override SSR styles (important for theme toggles).
			const cache = createCache({ key: 'mui' });
		cache.compat = true;

		const prevInsert = cache.insert;
		let inserted: string[] = [];

		// Intercept insert to track which names were added between renders
		cache.insert = (...args: any[]) => {
			// args: selector, serialized, sheet, shouldCache
			const serialized = args[1];
			if (cache.inserted[serialized.name] === undefined) {
				inserted.push(serialized.name);
			}
			// @ts-expect-error - emotion types for insert are not super strict here
			return prevInsert(...args);
		};

		const flush = () => {
			const prev = inserted;
			inserted = [];
			return prev;
		};

		return { cache, flush };
	});

	useServerInsertedHTML(() => {
		const names = flush();
		if (names.length === 0) return null;

		let styles = '';
		names.forEach((name) => {
			const style = cache.inserted[name];
			if (typeof style === 'string') {
				styles += style;
			}
		});

		return (
			<style
				data-emotion={`${cache.key} ${names.join(' ')}`}
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: styles }}
			/>
		);
	});

	return <CacheProvider value={cache}>{children}</CacheProvider>;
}

