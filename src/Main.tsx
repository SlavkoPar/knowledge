
//import { lazy, Suspense } from 'react'
import { MsalProvider, AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { Container } from 'react-bootstrap';
import { PageLayout } from './PageLayout';
//import { IdTokenData } from '@/components/DataDisplay';

import './App.css';
import { PublicClientApplication } from '@azure/msal-browser';
import { GlobalProvider } from '@/global/GlobalProvider';
//import { BrowserRouter as Router } from 'react-router-dom'

import App from './App';
import AboutShort from './AboutShort';
/**
* Most applications will need to conditionally render certain components based on whether a user is signed in or not. 
* msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will 
* only render their children if a user is authenticated or unauthenticated, respectively. For more, visit:
* https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
*/
const MainContent = () => {
    console.log('-----> MainContent')

    /**
    * useMsal is hook that returns the PublicClientApplication instance,
    * that tells you what msal is currently doing. For more, visit:
    * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
    */
    const { instance } = useMsal();

    const activeAccount = instance.getActiveAccount();

    // instance.handleRedirectPromise()
    //     .then(async (response) => {
    //         // This block is executed when the user is redirected back after a successful login.
    //         if (response) {
    //             console.log("Login successful! ID Token acquired:", response.idToken);
    //             // You can now set the active account and update UI state
    //             //instance.setActiveAccount(response.account);
    //             if (response.account) {
    //                 console.log("accountInfo:", response.account);
    //                 const { environment, tenantId, name, username } = response.account;
    //                 const wsDto: IWorkspaceDto = {
    //                     Workspace: '',
    //                     TopId: '',
    //                     Environment: environment,
    //                     ObjectId: tenantId,
    //                     DisplayName: name!,
    //                     Email: username
    //                 }
    //                 console.log("createWorkspace2:", createWorkspace)
    //                 await createWorkspace(wsDto);
    //             }
    //             // Redirect the user to their intended post-login page or view
    //         } else {
    //             // Check for existing accounts if no response was handled
    //             const accounts = instance.getAllAccounts();
    //             if (accounts.length > 0) {
    //                 instance.setActiveAccount(accounts[0]);
    //             }
    //         }
    //     }).catch(error => {
    //         // Handle errors that occurred during the redirect process
    //         console.error(error);
    //         // You might also want to handle specific errors like InteractionRequiredAuthError
    //     });

    /*
    const handleRedirect = () => {
        instance
            .loginRedirect({
                ...loginRequest,
                prompt: 'create',
            })
            .catch((error) => console.log(error));
    };
    */
    // const App = lazy(() =>
    //     // named export
    //     import("./App").then((module) => ({ default: module.default }))
    // );

    

    return (
        <div className="App">
            <AuthenticatedTemplate>
                {activeAccount ? (
                    <Container>
                        {/* <span>Moj id token</span>
                    <IdTokenData idTokenClaims={activeAccount.idTokenClaims} /> */}
                        <GlobalProvider>
                            {/* <Suspense fallback={<div>Loading...</div>}> */}
                            <App />
                            {/* </Suspense> */}
                        </GlobalProvider>
                    </Container>
                ) : null}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                {/* <Button className="signInButton" onClick={handleRedirect} variant="primary">
                    Sign up
                </Button> */}
                <AboutShort />
            </UnauthenticatedTemplate>
        </div>
    );
};


/**
* msal-react is built on the React context API and all parts of your app that require authentication must be 
* wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication 
* then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the 
* PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
* https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
*/
const Main = ({ instance }: { instance: PublicClientApplication }) => {
    console.log('---> Main')
    return (
        <MsalProvider instance={instance}>
            <PageLayout>
                <MainContent />
            </PageLayout>
        </MsalProvider>
    );
};

export default Main;