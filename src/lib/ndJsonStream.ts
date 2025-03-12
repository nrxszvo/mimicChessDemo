// ND-JSON response streamer
// See https://lichess.org/api#section/Introduction/Streaming-with-ND-JSON

type Handler = (line: any, stream: ReadableStream) => void;

export interface Stream {
	closePromise: Promise<void>;
	close(): Promise<void>;
}

export const readStream = (
	name: string,
	response: Response,
	handler: Handler,
	verbose: boolean = false,
	debug: boolean = true
): Stream => {
	const stream = response.body!.getReader();
	const matcher = /\r?\n/;
	const decoder = new TextDecoder();
	let buf = '';
	let nDone = 0;
	const process = (json: string) => {
		const msg = JSON.parse(json);
		handler(msg, stream);
	};

	const loop: () => Promise<void> = () =>
		stream.read().then(({ done, value }) => {
			if (debug) {
				console.log(`${name}: nDone=${nDone}, value size: ${value ? value.length : 0}`);
			}
			if (done) nDone++;
			if (nDone == 100) {
				if (buf.length > 0) process(buf);
				return;
			} else {
				if (value) {
					const chunk = decoder.decode(value, {
						stream: true
					});
					buf += chunk;

					const parts = buf.split(matcher);
					buf = parts.pop() || '';
					const fparts = parts.filter((p) => p);
					if (fparts.length > 0) {
						for (const i of fparts) process(i);
					} else if (verbose) {
						handler({ type: 'ping' });
					}
				}
				return loop();
			}
		});

	return {
		closePromise: loop(),
		close: () => stream.cancel()
	};
};
