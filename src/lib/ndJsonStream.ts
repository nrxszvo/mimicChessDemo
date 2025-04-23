// ND-JSON response streamer
// See https://lichess.org/api#section/Introduction/Streaming-with-ND-JSON

export interface Stream {
	closePromise: Promise<void>;
	close(): Promise<void>;
	updateHandler: (fn: any) => void;
	alive: boolean;
}

type Handler = (line: any, stream: Stream) => void;

export const readStream = (
	name: string,
	response: Response,
	handler: Handler,
	debug: boolean = false
): Stream => {
	const stream = response.body!.getReader();
	const matcher = /\r?\n/;
	const decoder = new TextDecoder();
	let alive = true;
	let buf = '';
	if (debug) console.log(name + ' opened');
	const process = (json: string) => {
		const msg = JSON.parse(json);
		handler(msg, stream);
	};

	const loop: () => Promise<void> = () =>
		stream.read().then(({ done, value }) => {
			if (done) {
				if (debug) console.log(name + ' closed');
				if (buf.length > 0) process(buf);
				alive = false;
				return;
			} else {
				const chunk = decoder.decode(value, {
					stream: true
				});
				buf += chunk;

				const parts = buf.split(matcher);
				buf = parts.pop() || '';
				const fparts = parts.filter((p) => p);
				if (fparts.length > 0) {
					for (const i of fparts) process(i);
				} else {
					handler({ type: 'ping' }, stream);
				}
				return loop();
			}
		});

	return {
		closePromise: loop(),
		close: () => stream.cancel(),
		updateHandler: (hdlr) => (handler = hdlr),
		get alive() {
			return alive;
		}
	};
};
