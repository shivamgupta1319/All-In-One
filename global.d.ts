declare module '@react-native-ml-kit/text-recognition' {
    export interface Frame {
        width: number;
        height: number;
        top: number;
        left: number;
    }

    export interface Point {
        x: number;
        y: number;
    }

    export interface Language {
        languageCode: string;
    }

    export type CornerPoints = readonly [Point, Point, Point, Point];

    export interface TextElement {
        text: string;
        frame?: Frame;
        cornerPoints?: CornerPoints;
    }

    export interface TextLine {
        text: string;
        frame?: Frame;
        cornerPoints?: CornerPoints;
        elements: TextElement[];
        recognizedLanguages: Language[];
    }

    export interface TextBlock {
        text: string;
        frame?: Frame;
        cornerPoints?: CornerPoints;
        lines: TextLine[];
        recognizedLanguages: Language[];
    }

    export interface TextRecognitionResult {
        text: string;
        blocks: TextBlock[];
    }

    export enum TextRecognitionScript {
        LATIN = 'Latin',
        CHINESE = 'Chinese',
        DEVANAGARI = 'Devanagari',
        JAPANESE = 'Japanese',
        KOREAN = 'Korean',
    }

    const TextRecognition: {
        recognize: (
            imageURL: string,
            script?: TextRecognitionScript
        ) => Promise<TextRecognitionResult>;
    };

    export default TextRecognition;
}
