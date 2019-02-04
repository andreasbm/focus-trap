let timeout: number | null = null;

/**
 * Debounces a callback.
 * @param cb
 * @param ms
 */
export function debounce (cb: (() => void), ms: number = 0) {
	if (timeout != null) {
		window.clearTimeout(timeout);
	}
	timeout = window.setTimeout(() => {
		cb();
		timeout = null;
	}, ms);
}
