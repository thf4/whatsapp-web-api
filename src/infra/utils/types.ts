export interface SessionToken {
  WABrowserId: string;
  WAToken1: string;
  WAToken2: string;
  WASecretBundle: string;
}

export interface TokenStore<T extends SessionToken = SessionToken> {
  /**
   * Return the session data if exists
   * @param sessionName Name of session
   */
  getToken(sessionName: string): Promise<T | undefined> | T | undefined;

  /**
   * Store the session token data
   * @param sessionName Name of session
   * @param tokenData Session token data
   */
  setToken(
    sessionName: string,
    tokenData: T | null
  ): Promise<boolean> | boolean;

  /**
   * Remove the session
   * @param sessionName Name of session
   * @returns Token was removed
   */
  removeToken(sessionName: string): Promise<boolean> | boolean;

  /**
   * A liste of avaliable sessions
   */
  listTokens(): Promise<string[]> | string[];
}
