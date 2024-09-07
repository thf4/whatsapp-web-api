import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sanitize from 'sanitize-filename';
import { SessionToken, TokenStore } from '../types';

export interface FileTokenStoreOptions {
  decodeFunction: (text: string) => any;
  encodeFunction: (data: any) => string;
  encoding: BufferEncoding;
  fileExtension: string;
  path: string;
}

const defaultFileTokenStoreOptions: FileTokenStoreOptions = {
  decodeFunction: JSON.parse,
  encodeFunction: JSON.stringify,
  encoding: 'utf8',
  fileExtension: '.data.json',
  path: './tokens',
};

export class FileTokenStore implements TokenStore {
  protected options: FileTokenStoreOptions;

  constructor(options: Partial<FileTokenStoreOptions> = {}) {
    this.options = {
      ...defaultFileTokenStoreOptions,
      ...options,
    };
  }

  /**
   * Resolve the path of the token file
   * @param sessionName Name of session
   * @returns Full path of token file
   */
  protected resolverPath(sessionName: string): string {
    const filename = sessionName + this.options.fileExtension;
    return path.resolve(process.cwd(), path.join(this.options.path, filename));
  }

  /**
   * Get a token for a given session
   * @param sessionName Name of session
   */
  public async getToken(
    sessionName: string,
  ): Promise<SessionToken | undefined> {
    const filePath = this.resolverPath(sessionName);

    if (!fs.existsSync(filePath)) {
      return undefined;
    }

    const text = await fs.promises
      .readFile(filePath, {
        encoding: this.options.encoding,
      })
      .catch(() => null);

    if (!text) {
      return undefined;
    }

    try {
      return this.options.decodeFunction(text);
    } catch (error) {
      console.debug(error);
      return undefined;
    }
  }

  /**
   * Set a token for a given session
   * @param sessionName Name of session
   * @param tokenData Token data
   */
  public async setToken(
    sessionName: string,
    tokenData: SessionToken | null,
  ): Promise<boolean> {
    if (!tokenData) {
      return false;
    }

    if (!fs.existsSync(this.options.path)) {
      await fs.promises.mkdir(this.options.path, { recursive: true });
    }

    const filePath = this.resolverPath(sessionName);

    try {
      const text = this.options.encodeFunction(tokenData);
      await fs.promises.writeFile(filePath, text, {
        encoding: this.options.encoding,
      });
      return true;
    } catch (error) {
      console.debug(error);
      return false;
    }
  }

  /**
   * Remove a token for a given session
   * @param sessionName Name of session
   */
  public async removeToken(sessionName: string): Promise<boolean> {
    const filePath = this.resolverPath(sessionName);

    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.debug(error);
      return false;
    }
  }

  /**
   * List all session tokens
   */
  public async listTokens(): Promise<string[]> {
    if (!fs.existsSync(this.options.path)) {
      return [];
    }

    try {
      let files = await fs.promises.readdir(this.options.path);

      files = files.filter((file) => file.endsWith(this.options.fileExtension));
      files = files.map((file) => path.basename(file, this.options.fileExtension));

      return files;
    } catch (error) {
      console.debug(error);
      return [];
    }
  }
}
