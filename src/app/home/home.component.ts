import { Component } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
    this.sendMessage();
  }

  currentUserMessage!: string;
  chatMessages: ChatMessage[] = [];  // ✅ Initialize it to avoid errors
  loadingResponse: boolean = false;

  result:string | null = null;


  // sendMessage() {
  //   this.currentUserMessage = "write a romantic song for my wife";

  //   if (this.currentUserMessage.trim() === "") return;

  //   this.loadingResponse = true;

  //   // Add user message
  //   this.chatMessages.push({ model: "tinyllama:latest", prompt: this.currentUserMessage });

  //   this.currentUserMessage = ""; // Clear input

  //   // Placeholder response message
  //   const responseMessage: ChatMessage = {
  //     model: "tinyllama:latest",
  //     prompt: "Waiting for response...",
  //   };

  //   this.chatMessages.push(responseMessage);

  //   this.http
  //     .post<string>("http://localhost:11434/api/generate", {
  //       model: "tinyllama:latest",
  //       prompt: this.chatMessages.map(msg => msg.prompt).join("\n"), // Combine messages
  //       stream: false // Disable streaming for now
  //     }, {
  //       observe: "events",
  //       responseType: "json",  // ✅ Ensures response is parsed automatically
  //       reportProgress: true,
  //     })
  //     .subscribe({
  //       next: (event: HttpEvent<any>) => { 
  //         if (event.type === HttpEventType.Response) { debugger
  //           const responseObj = event.body; // Parse JSON response
  //           responseMessage.prompt = responseObj?.response || "No response";
  //           this.loadingResponse = false;
  //           this.result = responseMessage.prompt;
  //           console.log(responseMessage.prompt)
  //         }
  //       },
  //       error: () => {
  //         this.loadingResponse = false;
  //         responseMessage.prompt = "⚠️ Error fetching response";
  //       },
  //     });

  //     console.log(responseMessage)
  // }


  sendMessage() { 

    this.currentUserMessage = "new top 10 ideas for business";

    if (!this.currentUserMessage.trim()) return;
  
    this.loadingResponse = true; 
  
    // Add user message to chat history
    this.chatMessages.push({ model: "tinyllama:latest", prompt: this.currentUserMessage });
  
    const responseMessage: ChatMessage = { model: "tinyllama:latest", prompt: "" };
    this.chatMessages.push(responseMessage);
  
    fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: this.currentUserMessage,
        stream: true, // Enable streaming
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
  
            // Decode and parse JSON object
            const chunk = decoder.decode(value, { stream: true });
  
            try {
              const jsonObjects = chunk.trim().split("\n").map((line) => JSON.parse(line));
              jsonObjects.forEach((obj) => {
                if (obj.response) {
                  responseMessage.prompt += obj.response; // Append only the response text
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
