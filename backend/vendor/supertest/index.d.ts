export interface TestResponse {
  status: number;
  headers: Record<string, string>;
  text: string;
  body: any;
}

export interface TestRequest extends PromiseLike<TestResponse> {
  set(name: string, value: string): TestRequest;
  send(body: unknown): TestRequest;
  catch(onRejected: (reason: unknown) => unknown): Promise<TestResponse>;
  finally(onFinally: () => void): Promise<TestResponse>;
}

export interface TestAgent {
  get(path: string): TestRequest;
  post(path: string): TestRequest;
  patch(path: string): TestRequest;
  delete(path: string): TestRequest;
}

export default function request(app: unknown): TestAgent;
