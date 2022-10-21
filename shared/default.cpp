#define OLC_PGE_APPLICATION
#include "olcPixelGameEngine.h"

// Override base class with your custom functionality
class Example : public olc::PixelGameEngine
{
public:
    Example()
    {
        // Name your application
        sAppName = "Example";
    }
    
public:
    bool OnUserCreate() override
    {
        // Called once at the start, so create things here
        color = RandomColor();
        return true;
    }
    
    bool OnUserUpdate(float fElapsedTime) override
    {
        // Called once per frame, draws random coloured pixels
        if(GetMouse(0).bPressed)
        {
            color = RandomColor();
            std::cout << GetMousePos().str() << "\n";
        }
            
        
        Clear(color);
        DrawRect(0,0,ScreenWidth()-1, ScreenHeight()-1, olc::YELLOW);
        DrawString(6,  6, "Hello, PGE", olc::BLACK);
        DrawString(5,  5, "Hello, PGE", olc::WHITE);
        DrawString(6, 26, "Mouse position SHOULD match\nclosely to the circle.\n\nYellow borders should ALWAYS\nbe visible\n\nLEFT MOUSE to change color.", olc::BLACK);
        DrawString(5, 25, "Mouse position SHOULD match\nclosely to the circle.\n\nYellow borders should ALWAYS\nbe visible\n\nLEFT MOUSE to change color.", olc::WHITE);
        
        DrawString(6, 221, GetMousePos().str(), olc::BLACK);
        DrawString(5, 220, GetMousePos().str(), olc::WHITE);
        FillCircle(GetMousePos(), 3, olc::RED);
        Draw(GetMousePos(), olc::WHITE);
        return true;
    }
    
    olc::Pixel RandomColor()
    {
        return olc::Pixel(rand() % 128, rand() % 128, rand() % 128);
    }
    
    olc::Pixel color;
};

int main()
{
    Example demo;
    if (demo.Construct(256, 240, 2, 2))
        demo.Start();
    return 0;
}