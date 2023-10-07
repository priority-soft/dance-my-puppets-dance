import openai from './config/open-ai.js';
import readlineSync from 'readline-sync';
import colors from 'colors';

async function main() {
    console.log(colors.bold.green('Pecko at your service! If you want to terminate the program type "exit". What\'s your name?'));

    const chatHistory = [];
    let userName = "My name is: ";
    let firstResponse = true;

    while (true) {
        const userInput = readlineSync.question(colors.yellow(userName));

        if (firstResponse) {
            userName = userInput + ': ';
            firstResponse = false;
        }

        // if you don't have a paid plan on openAI uncomment this block
        /*if (userInput.toLowerCase() === 'exit') {
            console.log(colors.green('Pecko: Goodbye! Hope to chat again soon.'));
            return;
        }*/

        try {
            // construct messages by iterating over the history
            const messages = chatHistory.map(([role, content]) => ({
                role,
                content,
            }));

            // adding latest user input
            messages.push({ role: 'user', content: userInput });

            // *Important note*: in case you don't have a paid plan on openAI, you'll get "RateLimitError: 429 You exceeded your current quota, please check your plan and billing details", and program will not work correctly.
            const completion = await openai.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
            });

            // get completion text/content
            const completionText = completion.choices[0].message;

            // user terminating the program
            if (userInput.toLowerCase() === 'exit') {
                console.log(colors.green('Pecko: ') + completionText);
                return;
            }

            console.log(colors.green('Pecko: ') + completionText);

            // updating chat history
            chatHistory.push(['user', userInput]);
            chatHistory.push(['assistant', completionText]);
        } catch (error) {
            console.error(colors.red(error));
        }
    }
}

main();