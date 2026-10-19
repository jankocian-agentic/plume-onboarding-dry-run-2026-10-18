declare module 'virtual:plume-config' {
	const configuration: {
		binding: import('@plume-press/sdk').ContentBinding;
		endpoint?: string;
		mode: 'preview' | 'published';
		descriptor: import('@plume-press/sdk').DeliveryDescriptor | null;
	};
	export default configuration;
}
