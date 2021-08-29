type Extension = {
  icon?: string;
  process: string[];
};

const extensions = {
  ".img": {
    icon: "image",
    process: ["V86"],
  },
  ".iso": {
    icon: "image",
    process: ["FileExplorer", "V86"],
  },
  ".jsdos": {
    icon: "jsdos",
    process: ["JSDOS", "FileExplorer"],
  },
  ".mp3": {
    icon: "music",
    process: ["Webamp"],
  },
  ".spl": {
    process: ["Ruffle"],
  },
  ".swf": {
    process: ["Ruffle"],
  },
  ".wsz": {
    icon: "music",
    process: ["Webamp"],
  },
  ".zip": {
    icon: "compressed",
    process: ["FileExplorer", "JSDOS"],
  },
};

export type ExtensionType = keyof typeof extensions;

export default extensions as Record<ExtensionType, Extension>;
