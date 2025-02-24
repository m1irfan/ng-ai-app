import { Component } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Quiz } from '../models/quiz';

export interface ChatMessage {
  model: string | null;
  prompt: string | null;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {

  constructor(private http: HttpClient) {
    //this.sendMessage();
    //this.quiz = new Quiz();
  }

  currentUserMessage!: string;
  chatMessages: ChatMessage[] = [];  // ✅ Initialize it to avoid errors
  loadingResponse: boolean = false;

  result:string | null = null;

  input:string = "";

  quiz:Quiz[] = [];



  // sendMessage(event:Event) { 

  //   this.input = (event.target as HTMLInputElement).value;

  //   //this.currentUserMessage = "provide me html code of chat-gpt like prompt interface";
  //   this.currentUserMessage = this.input ;//+ "always return output as html, and no need to tell that you are returning as html";


  //   if (!this.currentUserMessage.trim()) return;
  
  //   this.loadingResponse = true; 
  
  //   // Add user message to chat history
  //   //this.chatMessages.push({ model: "tinyllama:latest", prompt: this.currentUserMessage });
  
  //   const responseMessage: ChatMessage = { model: "tinyllama:latest", prompt: "" };
  //   this.chatMessages.push(responseMessage);
  
  //   fetch("http://localhost:11434/api/generate", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       model: "llama3.2:3b",
  //       prompt: this.currentUserMessage,
  //       stream: true, // Enable streaming
  //     }),
  //   })
  //     .then((response) => {
  //       const reader = response.body?.getReader();
  //       const decoder = new TextDecoder();
  
  //       if (!reader) {
  //         throw new Error("ReadableStream not supported");
  //       }
  
  //       const readStream = () => {
  //         reader.read().then(({ done, value }) => {
  //           if (done) {
  //             this.loadingResponse = false;
  //             return;
  //           }
  
  //           // Decode and parse JSON object
  //           const chunk = decoder.decode(value, { stream: true });
  
  //           try { debugger
  //             const jsonObjects = chunk.trim().split("\n").map((line) => JSON.parse(line));
  //             jsonObjects.forEach((obj) => {
  //               if (obj.response) {
  //                 responseMessage.prompt += obj.response; // Append only the response text
  //               }
  //               const myjson = JSON.parse(responseMessage.prompt!);
  //               console.log(myjson);
  //               this.quiz = myjson;
  //               console.log(this.quiz);
  //             });
  //           } catch (err) {
  //             console.error("JSON parse error:", err);
  //           }
  
  //           readStream(); // Read next chunk
  //         });
  //       };
  //       readStream();
  //     })
  //     .catch(() => {
  //       this.loadingResponse = false;
  //       responseMessage.prompt = "⚠️ Error fetching response";
  //     });
  
  //   this.currentUserMessage = ""; // Clear input field
  // }
  

  sendMessage(event: Event) { 
    this.input = (event.target as HTMLInputElement).value;
    this.currentUserMessage = this.input;

    if (!this.currentUserMessage.trim()) return;

    this.loadingResponse = true; 

    const responseMessage: ChatMessage = { model: "tinyllama:latest", prompt: "" };
    this.chatMessages.push(responseMessage);

    fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: this.currentUserMessage,
        stream: true,
      }),
    })
    .then((response) => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("ReadableStream not supported");
        }

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              this.loadingResponse = false;
              return;
            }

            const chunk = decoder.decode(value, { stream: true });

            try {
              const jsonObjects = chunk.trim().split("\n").map((line) => JSON.parse(line));
              jsonObjects.forEach((obj) => {
                if (obj.response) {
                  responseMessage.prompt += obj.response; 
                }

                // ✅ Parse and cast response into Quiz object
                try {
                  const parsedQuiz = JSON.parse(responseMessage.prompt || "{}");
                  //this.quiz = JSON.parse(parsedQuiz).map((q: any) => Object.assign(new Quiz(), q));
                  this.quiz = parsedQuiz;
                  console.log(parsedQuiz);
                  console.log(this.quiz);
                } catch (jsonError) {
                  console.error("Error parsing Quiz JSON:", jsonError);
                }
              });
            } catch (err) {
              console.error("JSON parse error:", err);
            }

            readStream(); // Read next chunk
          });
        };
        readStream();
      })
      .catch(() => {
        this.loadingResponse = false;
        responseMessage.prompt = "⚠️ Error fetching response";
      });

    this.currentUserMessage = ""; // Clear input field
}


}
