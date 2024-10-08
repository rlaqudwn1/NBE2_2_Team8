import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = ({ openModal }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
    const [isMenuOpen, setIsMenuOpen] = useState(false); // 하위 메뉴 상태

    useEffect(() => {
        const cookies = document.cookie.split('; ').find(row => row.startsWith('Authorization='));
        if (cookies) {
            const token = cookies.split('=')[1];
            if (token) {
                setIsLoggedIn(true);
            }
        }
    }, []);

    const handleLogout = () => {
        document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("memberId");

        setIsLoggedIn(false);
        navigate('/courses');
    };

    const isCoursesPage = location.pathname === "/courses";
    const isCourseDetailPage = location.pathname.startsWith("/courses/");

    return (
        <NavBar>
            <LeftSection>
                {isCourseDetailPage && (
                    <>
                        <NavItem>강의</NavItem>
                        <NavItem>문의</NavItem>
                        <SearchBar>
                            <input type="text" placeholder="검색해보세요" />
                            <button>🔍</button>
                        </SearchBar>
                    </>
                )}

            </LeftSection>
            <LogoWrapper onClick={() => navigate("/courses")}>
                <Logo>Learner</Logo>
            </LogoWrapper>

            <RightSection>
                {isLoggedIn ? (
                    <>
                        <NavItem onClick={() => navigate('/inquiries')}>문의</NavItem>
                        <NavItem onClick={() => setIsMenuOpen(!isMenuOpen)}>마이페이지</NavItem>
                        {isMenuOpen && (
                            <SubMenu>
                                <SubMenuItem onClick={() => navigate('/내정보')}>내정보</SubMenuItem> {/* 내정보 클릭 시 마이페이지로 이동 */}
                                <SubMenuItem onClick={() => navigate('/courses/list')}>내 학습</SubMenuItem>
                                <SubMenuItem onClick={() => navigate('/orders')}>장바구니</SubMenuItem>
                                <SubMenuItem onClick={() => navigate('/edit-profile')}>회원정보 수정</SubMenuItem>
                                <SubMenuItem onClick={() => navigate('/my-courses')}>내 수강 정보</SubMenuItem>
                                <SubMenuItem onClick={handleLogout}>로그아웃</SubMenuItem>
                            </SubMenu>
                        )}
                    </>
                ) : (
                    <Menu>
                        <StyledButton onClick={openModal}>로그인</StyledButton>
                        <Link to="/signup">
                            <StyledButton>회원가입</StyledButton>
                        </Link>
                    </Menu>
                )}
            </RightSection>
        </NavBar>
    );
};

export default Header;


// 스타일 컴포넌트들

const NavBar = styled.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 0.5rem 1rem;
    height: 60px;
    border-bottom: 1px solid #ddd;
    margin: 0 auto;
    position: relative; /* 메뉴가 페이지 밖으로 나가지 않도록 NavBar에 상대 위치 부여 */
    overflow: visible; /* NavBar 범위를 넘어가는 내용을 보이게 함 */
`;

const LeftSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-right: auto; /* LeftSection을 왼쪽으로 정렬 */
`;

const LogoWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute; /* 부모 요소에서 절대 위치 */
    left: 50%; /* 페이지의 50% 지점에 위치 */
    transform: translateX(-50%); /* 중앙에 고정시키기 위해 왼쪽으로 50% 이동 */
    cursor: pointer;
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;
    position: relative; /* SubMenu가 RightSection 안에 표시되도록 설정 */
`;

const Logo = styled.h1`
    font-size: 1.5rem;
    color: #3cb371;
    cursor: pointer;
`;

const Menu = styled.div`
    display: flex;
    gap: 1rem;
`;

const StyledButton = styled.button`
    background-color: #3cb371;
    color: white;
    border: 2px solid #3cb371;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    &:hover {
        background-color: white;
        color: #3cb371;
    }
`;

const NavItem = styled.span`
    cursor: pointer;
    padding: 0.5rem 1rem;
    position: relative;
    border-radius: 5px;
    &:hover {
        background-color: #3cb371;
        color: white;
    }
`;

const SubMenu = styled.div`
    position: absolute;
    top: 100%; /* NavItem 바로 아래에 위치하도록 설정 */
    left: 0;
    display: flex;
    flex-direction: column;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-top: 0.5rem;
    z-index: 1000; /* 메뉴가 다른 요소 위에 나타나도록 설정 */
    width: 150px;
    overflow: visible; /* 메뉴가 페이지 밖으로 나가지 않도록 설정 */
`;

const SubMenuItem = styled(NavItem)`
    padding: 0.5rem 1rem;
    &:hover {
        background-color: #f0f0f0;
    }
`;

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    margin-left: 1rem;
    input {
        padding: 0.5rem;
        border-radius: 20px;
        border: 1px solid #ddd;
        width: 200px;
        margin-right: 0.5rem;
    }
    button {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
    }
`;
