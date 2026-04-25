import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface Config {
  dbUrl: string;
  currentUserName?: string;
}

export function getConfigFilePath(): string {
	return path.join(os.homedir(), ".gatorconfig.json");
}

export function readConfig(): Config {
  const configPath = getConfigFilePath();
  try {
    const file = fs.readFileSync(configPath, "utf-8");
    const raw = JSON.parse(file);
    if (typeof raw.db_url !== "string") {
      throw new Error(`Invalid db_url in config file: ${typeof raw.db_url}`);
    }
    return {
      dbUrl: raw.db_url,
      currentUserName: typeof raw.current_user_name === "string" ? raw.current_user_name : undefined,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Config file doesn't exist, create a default one
      const defaultConfig: Config = {
        dbUrl: "postgres://user:password@localhost:5432/gator",
        currentUserName: undefined,
      };
      writeConfig(defaultConfig);
      console.log(`Created default config file at ${configPath}`);
      console.log("Please update the db_url with your actual PostgreSQL connection string");
      return defaultConfig;
    }
    throw error;
  }
}

export function writeConfig(cfg: Config): void {
  const file = JSON.stringify({
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  });
  fs.writeFileSync(getConfigFilePath(), file);
}

export function setUser(userName: string): void {
  const cfg = readConfig();
  cfg.currentUserName = userName;
  writeConfig(cfg);
}