import { useEffect, useState, lazy, Suspense } from 'react';
import { Container, Row, Col, Button } from "react-bootstrap";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { useGlobalContext, useGlobalDispatch, useGlobalState } from '@/global/GlobalProvider'


import './App.css';
import './AutoSuggest.css';

// Dynamic imports
const Categories = lazy(() =>
  // named export
  import("@/categories/Categories").then((module) => ({ default: module.default }))
);

const Groups = lazy(() =>
  // named export
  import("@/groups/Groups").then((module) => ({ default: module.default }))
);

const ChatBotDlg = lazy(() =>
  // named export
  import("./ChatBotDlg").then((module) => ({ default: module.default }))
);

import About from './About';
import Health from './Health';
import { type IUser, type IWorkspaceDto } from '@/global/types';
import { type AccountInfo } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import AboutShort from './AboutShort';

function App() {

  const { authUser, isAuthenticated, everLoggedIn, lastRouteVisited, chatBotDlgEnabled } = useGlobalState();
  const { nickName } = authUser;

  let location = useLocation();
  const navigate = useNavigate();
  const dispatch = useGlobalDispatch();
  const { createWorkspace, getWorkspace } = useGlobalContext();

  const { instance } = useMsal();

  const [showModalChatBot, setModalChatBotShow] = useState(false);



  useEffect(() => {
    (async () => {
     
      if (!isAuthenticated) {
        if (instance) {
          const createWS = localStorage.getItem('createWS');
          if (createWS) {
            console.log('creating WS');
            const wsDto: IWorkspaceDto = JSON.parse(createWS);
            localStorage.removeItem('createWS');
            await createWorkspace(wsDto);
            return;
          }
          else {
            const activeAccount: AccountInfo | null = instance.getActiveAccount();
            const { environment, tenantId, username } = activeAccount!;
            const wsDto: IWorkspaceDto = {
              Workspace: '',
              TopId: '',
              TenantId: tenantId!,
              Environment: environment,
              DisplayName: activeAccount?.name ? activeAccount.name : 'Unknown',
              Email: username
            };
            const name = (activeAccount && activeAccount.name) ? activeAccount.name : 'Unknown';
            await getWorkspace(wsDto);
            // const user: IUser = {
            //   nickName: name,
            //   name,
            //   workspace: activeAccount?.tenantId!,
            //   email: activeAccount?.username!,
            //   environment: activeAccount?.environment!
            // }
            //dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user, newUser: true } });
          }
        }
      }
    })()
  }, [dispatch, instance, isAuthenticated]) // , isAuthenticated


  const locationPathname = location.pathname;
  console.log('----------- ====== App locationPathname ===>>>', locationPathname);

  // const showChatBotDlg = (locationPathname.startsWith('/categories') && allCategoryRowsLoaded) ||
  //   (locationPathname.startsWith('/groups') && groupRowsLoaded);

  useEffect(() => {
    (async () => {
      const searchParams = new URLSearchParams(location.search);
      const isAuthRoute = locationPathname.startsWith('/invitation') ||
        locationPathname.startsWith('/register') ||
        locationPathname.startsWith('/sign-in') ||
        locationPathname.startsWith('/about');  // allow about without registration
      if (!isAuthenticated && !isAuthRoute) {
        if (everLoggedIn) {
        }
        else {
        }
      }
      else {
      }
      const supporter = searchParams.get('supporter');
      if (isAuthenticated && supporter === '1') {
        const source = searchParams.get('source');
        const question = searchParams.get('subject');
        const email = searchParams.get('email');
        if (!email || email === 'xyz') {
          localStorage.removeItem('emailFromClient')
        }
        else {
          localStorage.setItem('emailFromClient', email ?? 'slavko.parezanin@gmail.com')
        }
        navigate(`/supporter/${source}/${question}`);
      }
    })()
  }, [isAuthenticated, nickName, everLoggedIn, locationPathname, navigate, location.search])


  useEffect(() => {
    if (locationPathname === '/knowledge' && !locationPathname.includes('/from_chat')) {
      navigate(lastRouteVisited);
    }
  }, [lastRouteVisited])

  if (!isAuthenticated) // || !categoryRowsLoaded) // || !groupRowsLoaded)
    return <div>App loading</div>

  //alert(process.env.REACT_APP_API_URL)
  console.log('Appppppppppppppppppppppppppppppppppppppppppppppppp')

  return (
    <Container fluid className="App" data-bs-theme="light">
      {/* <header className="App-header">
        <Navigation />
      </header> */}
      <Row>
        <Col md={10} className="py-0">
          <div className="wrapper">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={(!isAuthenticated && !everLoggedIn) ? <AboutShort /> : <Categories />} />
                <Route path="/knowledge" element={(!isAuthenticated && !everLoggedIn) ? <AboutShort /> : <Categories />} />
                {/* <Route path="" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} /> */}
                {/* <Route path="/register/:returnUrl" element={<RegisterForm />} />
                    <Route path="/sign-in" element={<LoginForm initialValues={formInitialValues} invitationId='' />} /> */}
                {/* <Route path="/supporter/:source/:tekst" element={<SupportPage />} />
                <Route path="/supporter/:source/:tekst/:email" element={<SupportPage />} /> */}
                {/* <Route path="/ChatBotPage/:source/:tekst/:email" element={<ChatBotPage />} /> */}
                <Route path="/knowledge/categories/:categoryId_questionId/:fromChatBotDlg" element={<Categories />} />
                <Route path="/knowledge/categories" element={<Categories />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/groups/:groupId_AnswerId" element={<Groups />} />
                <Route path="/knowledge/groups" element={<Groups />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/about" element={<About />} />
                <Route path="/about-short" element={<AboutShort />} />
                <Route path="/health" element={<Health />} />
              </Routes>
            </Suspense>
          </div>
        </Col>
      </Row>
      {/* {<ModalChatBot show={modalChatBotShow} onHide={() => { setModalChatBotShow(false) }} />} */}
      {chatBotDlgEnabled &&
        <>
          {showModalChatBot &&
            <Suspense fallback={<div>Loading...</div>}>
              <ChatBotDlg show={showModalChatBot} onHide={() => { setModalChatBotShow(false) }} />
            </Suspense>
          }
          <Button onClick={(e) => {
            setModalChatBotShow(!showModalChatBot);
            e.stopPropagation();
          }}
            className="border rounded-5 me-1 mb-1 buddy-fixed"
          >
            <b>Welcome,</b><br /> I am Stamena,<br /> and You are not.
            <br />I am here to help You!
          </Button>
        </>
      }

    </Container>
  );
}

export default App;
