build:
	wasm-pack build --target web

run:
	python3 -m http.server --directory /home/katreon/Rust/WebFramework/rustact